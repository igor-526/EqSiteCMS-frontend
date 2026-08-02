import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { HorseBreedCreateUpdateModal } from "./HorseBreedsCreateUpdateModal";
import type { HorseBreedOutDto } from "@/types/api/horseBreeds";
import type { UUID } from "crypto";

const breed: HorseBreedOutDto = {
    id: "00000000-0000-4000-8000-000000000101" as UUID,
    name: "Уэльская",
    short_name: "Уэл.",
    slug: "welsh",
    description: null,
    kind: "pony",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
};

const noop = vi.fn();

const renderModal = (
    selectedHorseBreed: HorseBreedOutDto | null = null,
    overrides: Partial<React.ComponentProps<typeof HorseBreedCreateUpdateModal>> = {},
) => renderWithCmsProviders(
    <HorseBreedCreateUpdateModal
        open
        onClose={noop}
        selectedHorseBreed={selectedHorseBreed}
        onCreate={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        validationErrors={{}}
        onResetValidation={noop}
        {...overrides}
    />,
);

describe("HorseBreedCreateUpdateModal", () => {
    beforeEach(() => {
        noop.mockClear();
    });

    it("defaults create kind to horse and includes it in payload", async () => {
        const onCreate = vi.fn();
        renderModal(null, { onCreate });

        await userEvent.type(screen.getByLabelText("Наименование породы"), "Арабская");
        await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));

        expect(onCreate).toHaveBeenCalledTimes(1);
        expect(onCreate.mock.calls[0][0]).toMatchObject({
            name: "Арабская",
            kind: "horse",
        });
    });

    it("uses selected breed kind for update payload", async () => {
        const onUpdate = vi.fn();
        renderModal(breed, { onUpdate });

        await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onUpdate.mock.calls[0][1]).toMatchObject({ kind: "pony", short_name: "Уэл." });
    });

    it("submits empty and 63-character short names and displays field errors", async () => {
        const onCreate = vi.fn();
        const { unmount } = renderModal(null, { onCreate });
        await userEvent.type(screen.getByLabelText("Наименование породы"), "Арабская");
        await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));
        expect(onCreate.mock.calls[0][0]).toMatchObject({ short_name: "" });
        unmount();

        const value = "а".repeat(63);
        const secondCreate = vi.fn();
        renderModal(null, { onCreate: secondCreate, validationErrors: { short_name: ["Ошибка поля"] } });
        await userEvent.type(screen.getByLabelText("Короткое наименование"), value);
        expect(screen.getByDisplayValue(value)).toBeInTheDocument();
        expect(screen.getByText("Ошибка поля")).toBeInTheDocument();
    });

    it("renders type selector options", async () => {
        renderModal();

        await userEvent.click(screen.getByText("Лошадь"));

        expect(screen.getByText("Пони")).toBeInTheDocument();
    });

    it("guards create from double submit", async () => {
        let resolveSubmit: (() => void) | undefined;
        const onCreate = vi.fn(() => new Promise<void>((resolve) => { resolveSubmit = resolve; }));
        renderModal(null, { onCreate });
        await userEvent.type(screen.getByLabelText("Наименование породы"), "Арабская");
        const submit = screen.getByRole("button", { name: /Добавить/ });
        await userEvent.dblClick(submit);
        expect(onCreate).toHaveBeenCalledTimes(1);
        resolveSubmit?.();
    });
});
