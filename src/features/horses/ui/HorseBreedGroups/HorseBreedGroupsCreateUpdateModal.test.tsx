import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HorseBreedGroupsCreateUpdateModal } from "./HorseBreedGroupsCreateUpdateModal";

const group = { id: "00000000-0000-4000-8000-000000000201" as never, name: "Верховые", slug: "verhovye", created_at: "2026-01-01", updated_at: null };
const base = { open: true, onClose: vi.fn(), selected: null, onCreate: vi.fn().mockResolvedValue(true), onUpdate: vi.fn().mockResolvedValue(true), onDelete: vi.fn().mockResolvedValue(true), validationErrors: {}, onResetValidation: vi.fn(), canMutate: true, canDelete: true };

describe("HorseBreedGroupsCreateUpdateModal", () => {
  it("opens, closes and submits create once during double click", async () => {
    render(<HorseBreedGroupsCreateUpdateModal {...base} />); fireEvent.change(screen.getByLabelText("Наименование"), { target: { value: "Спортивные" } });
    const submit = screen.getByRole("button", { name: /Добавить/ }); fireEvent.click(submit); fireEvent.click(submit);
    await waitFor(() => expect(base.onCreate).toHaveBeenCalledTimes(1)); expect(base.onCreate).toHaveBeenCalledWith({ name: "Спортивные", slug: "" });
    fireEvent.click(screen.getByRole("button", { name: /Закрыть/ })); expect(base.onClose).toHaveBeenCalled();
  });
  it("retains values after rejected backend request", async () => {
    const onCreate = vi.fn().mockResolvedValue(false); render(<HorseBreedGroupsCreateUpdateModal {...base} onCreate={onCreate} />);
    fireEvent.change(screen.getByLabelText("Наименование"), { target: { value: "Сохранить" } }); fireEvent.click(screen.getByRole("button", { name: /Добавить/ }));
    await waitFor(() => expect(onCreate).toHaveBeenCalled()); expect(screen.getByLabelText("Наименование")).toHaveValue("Сохранить");
  });
  it("renders validation and guards actions without scopes", () => {
    render(<HorseBreedGroupsCreateUpdateModal {...base} validationErrors={{ name: ["Обязательное поле"] }} canMutate={false} canDelete={false} />);
    expect(screen.getByText("Обязательное поле")).toBeInTheDocument(); expect(screen.queryByRole("button", { name: /Добавить/ })).not.toBeInTheDocument();
  });
  it("updates and exposes guarded delete for selected group", async () => {
    render(<HorseBreedGroupsCreateUpdateModal {...base} selected={group} />); fireEvent.click(screen.getByRole("button", { name: /Изменить/ }));
    await waitFor(() => expect(base.onUpdate).toHaveBeenCalledWith(String(group.id), { name: group.name, slug: group.slug })); expect(screen.getByRole("button", { name: /Удалить/ })).toBeInTheDocument();
  });
});
