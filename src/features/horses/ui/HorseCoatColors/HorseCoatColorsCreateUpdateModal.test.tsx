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
        onDelete={vi.fn()} validationErrors={{}} onResetValidation={vi.fn()} canMutate canDelete {...overrides} />);

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

    it("renders a name-only backend error without reading a missing description error", () => {
        renderModal(null, { validationErrors: { name: ["Укажите наименование"] } });
        expect(screen.getByText("Укажите наименование")).toBeInTheDocument();
        expect(screen.getByText("0/511")).toBeInTheDocument();
    });

    it("renders only description errors beside the description field", () => {
        renderModal(null, { validationErrors: { description: ["Ошибка описания", "Повторите ввод"] } });
        expect(screen.getByText(/Ошибка описания/)).toHaveTextContent("Ошибка описания Повторите ввод");
    });

    it("submits empty optional slug and description unchanged", async () => {
        const onCreate = vi.fn();
        renderModal(null, { onCreate });
        await userEvent.type(screen.getByLabelText("Наименование масти"), "Серая");
        await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));
        expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ slug: "", description: "" }));
    });

    it("retains entered values after a failed Protected Write", async () => {
        const onCreate = vi.fn().mockResolvedValue(false);
        const onClose = vi.fn();
        const onUpdate = vi.fn();
        const onDelete = vi.fn();
        const onResetValidation = vi.fn();
        const { rerender } = renderModal(null, { onCreate, onClose, onUpdate, onDelete, onResetValidation });
        await userEvent.type(screen.getByLabelText("Наименование масти"), "Сохранённая масть");
        await userEvent.type(screen.getByLabelText("Описание масти"), "Сохранённое описание");
        await userEvent.click(screen.getByRole("button", { name: /Добавить/ }));
        rerender(<HorseCoatColorsCreateUpdateModal open onClose={onClose}
            selectedHorseCoatColor={null} onCreate={onCreate} onUpdate={onUpdate} onDelete={onDelete}
            validationErrors={{ name: ["Backend validation"] }} onResetValidation={onResetValidation} canMutate canDelete />);
        expect(screen.getByDisplayValue("Сохранённая масть")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Сохранённое описание")).toBeInTheDocument();
        expect(screen.getByText("Backend validation")).toBeInTheDocument();
    });

    it("hides and guards create without dictionary scope", () => {
        const onCreate = vi.fn();
        renderModal(null, { onCreate, canMutate: false });
        expect(screen.queryByRole("button", { name: /Добавить/ })).not.toBeInTheDocument();
        expect(onCreate).not.toHaveBeenCalled();
    });

    it("hides update and delete without dictionary scope", () => {
        renderModal(coat, { canMutate: false, canDelete: false });
        expect(screen.queryByRole("button", { name: /Изменить/ })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Удалить/ })).not.toBeInTheDocument();
    });
});
