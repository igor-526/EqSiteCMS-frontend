import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import type { HorseCoatColorOutDto } from "@/types/api/horseCoatColor";
import type { UUID } from "crypto";
import { HorseCoatColorsCreateUpdateModal } from "./HorseCoatColorsCreateUpdateModal";

const coat: HorseCoatColorOutDto = {
    id: "00000000-0000-4000-8000-000000000201" as UUID,
    name: "Гнедая", short_name: "Гн.", slug: "bay", description: null,
    created_at: "2026-01-01T00:00:00Z", updated_at: null,
};

const renderModal = (selectedHorseCoatColor: HorseCoatColorOutDto | null, overrides = {}) =>
    renderWithCmsProviders(<HorseCoatColorsCreateUpdateModal open onClose={vi.fn()}
        selectedHorseCoatColor={selectedHorseCoatColor} onCreate={vi.fn()} onUpdate={vi.fn()}
        onDelete={vi.fn()} validationErrors={{}} onResetValidation={vi.fn()} {...overrides} />);

describe("HorseCoatColorsCreateUpdateModal", () => {
    it("opens create, closes and submits an empty short name", async () => {
        const onCreate = vi.fn();
        const onClose = vi.fn();
        renderModal(null, { onCreate, onClose });
        await userEvent.type(screen.getByLabelText("Наименование масти"), "Серая");
        await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));
        expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ name: "Серая", short_name: "" }));
        await userEvent.click(screen.getByRole("button", { name: /Закрыть/ }));
        expect(onClose).toHaveBeenCalled();
    });

    it("prefills and submits an update short name", async () => {
        const onUpdate = vi.fn();
        renderModal(coat, { onUpdate });
        expect(screen.getByDisplayValue("Гн.")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /Изменить/ }));
        expect(onUpdate).toHaveBeenCalledWith(coat.id, expect.objectContaining({ short_name: "Гн." }));
    });

    it("supports 63 chars and renders a backend field error", async () => {
        const value = "г".repeat(63);
        renderModal(null, { validationErrors: { short_name: ["Недопустимое значение"] } });
        await userEvent.type(screen.getByLabelText("Короткое наименование"), value);
        expect(screen.getByDisplayValue(value)).toBeInTheDocument();
        expect(screen.getByText("Недопустимое значение")).toBeInTheDocument();
    });

    it("guards create from double submit", async () => {
        let resolveSubmit: (() => void) | undefined;
        const onCreate = vi.fn(() => new Promise<void>((resolve) => { resolveSubmit = resolve; }));
        renderModal(null, { onCreate });
        await userEvent.type(screen.getByLabelText("Наименование масти"), "Гнедая");
        await userEvent.dblClick(screen.getByRole("button", { name: /Добавить/ }));
        expect(onCreate).toHaveBeenCalledTimes(1);
        resolveSubmit?.();
    });
});
