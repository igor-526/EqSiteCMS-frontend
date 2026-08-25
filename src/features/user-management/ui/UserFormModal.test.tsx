import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UUID } from "crypto";
import { UserFormModal } from "./UserFormModal";

const managerId = "00000000-0000-4000-8000-000000000001" as UUID;
const superId = "00000000-0000-4000-8000-000000000002" as UUID;
const equestrianId = "00000000-0000-4000-8000-000000000003" as UUID;
const roles = [
  { id: managerId, scope_name: "USER_MANAGER", scope_description: null },
  { id: superId, scope_name: "SUPERUSER", scope_description: null },
];
const base = {
  open: true, onClose: vi.fn(), roles, rolesLoading: false, rolesError: null, equestrianId,
  onCreate: vi.fn().mockResolvedValue(false), onUpdate: vi.fn().mockResolvedValue(false),
  validationErrors: {}, onResetValidation: vi.fn(),
};

describe("UserFormModal role selector", () => {
  it("preloads edit values and shows localized labels, never UUID", async () => {
    render(<UserFormModal {...base} user={{ id: superId, equestrian_id: equestrianId, username: "ivan", first_name: "Иван", last_name: null, middle_name: null, is_blocked: false, created_at: "2026-01-01", updated_at: null, scopes: [roles[0]] }} />);
    await waitFor(() => expect(screen.getByText("Менеджер пользователей")).toBeInTheDocument());
    expect(document.querySelector(".ant-select-selector")?.textContent ?? "").not.toContain(managerId);
  });

  it("keeps UUID values in create payload and guards double submit", async () => {
    const onCreate = vi.fn().mockResolvedValue(false);
    render(<UserFormModal {...base} user={null} onCreate={onCreate} />);
    fireEvent.change(screen.getByPlaceholderText("username"), { target: { value: "new-user" } });
    fireEvent.change(screen.getByPlaceholderText("Минимум 8 символов"), { target: { value: "Password1" } });
    fireEvent.change(screen.getByPlaceholderText("Повторите пароль"), { target: { value: "Password1" } });
    const selector = screen.getByRole("combobox");
    fireEvent.mouseDown(selector);
    fireEvent.click(await screen.findByText("Менеджер пользователей"));
    const submit = screen.getByRole("button", { name: /создать/i });
    fireEvent.click(submit); fireEvent.click(submit);
    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    expect(onCreate.mock.calls[0][0].scope_ids).toEqual([managerId]);
    expect(onCreate.mock.calls[0][0].equestrian_id).toBe(equestrianId);
  });

  it("keeps multiple UUIDs and localized selected tags", async () => {
    const onCreate = vi.fn().mockResolvedValue(false);
    render(<UserFormModal {...base} user={null} onCreate={onCreate} />);
    fireEvent.change(screen.getByPlaceholderText("username"), { target: { value: "new-user" } });
    fireEvent.change(screen.getByPlaceholderText("Минимум 8 символов"), { target: { value: "Password1" } });
    fireEvent.change(screen.getByPlaceholderText("Повторите пароль"), { target: { value: "Password1" } });
    const selector = screen.getByRole("combobox");
    fireEvent.mouseDown(selector); fireEvent.click(await screen.findByText("Менеджер пользователей"));
    fireEvent.mouseDown(selector); fireEvent.click(await screen.findByText("Суперпользователь"));
    expect(screen.getAllByText("Менеджер пользователей").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Суперпользователь").length).toBeGreaterThan(0);
    expect(document.querySelector(".ant-select-selector")?.textContent ?? "").not.toContain(managerId);
    fireEvent.click(screen.getByRole("button", { name: /создать/i }));
    await waitFor(() => expect(onCreate.mock.calls[0][0].scope_ids).toEqual([managerId, superId]));
  });

  it("preserves create form after failure and closes after success", async () => {
    const onCreate = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const onClose = vi.fn();
    render(<UserFormModal {...base} user={null} onCreate={onCreate} onClose={onClose} />);
    const username = screen.getByPlaceholderText("username");
    fireEvent.change(username, { target: { value: "kept-user" } });
    fireEvent.change(screen.getByPlaceholderText("Минимум 8 символов"), { target: { value: "Password1" } });
    fireEvent.change(screen.getByPlaceholderText("Повторите пароль"), { target: { value: "Password1" } });
    const submit = screen.getByRole("button", { name: /создать/i });
    fireEvent.click(submit);
    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    expect(username).toHaveValue("kept-user"); expect(onClose).not.toHaveBeenCalled();
    await waitFor(() => expect(submit).not.toHaveClass("ant-btn-loading"));
    fireEvent.click(submit);
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("submits update UUIDs, preserves edit form after denial and closes after success", async () => {
    const onUpdate = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const onClose = vi.fn();
    const user = { id: superId, equestrian_id: equestrianId, username: "ivan", first_name: "Иван", last_name: null, middle_name: null, is_blocked: false, created_at: "2026-01-01", updated_at: null, scopes: [roles[0]] };
    render(<UserFormModal {...base} user={user} onUpdate={onUpdate} onClose={onClose} />);
    const firstName = screen.getByPlaceholderText("Имя");
    await waitFor(() => expect(firstName).toHaveValue("Иван"));
    fireEvent.change(firstName, { target: { value: "Пётр" } });
    const submit = screen.getByRole("button", { name: /сохранить/i });
    fireEvent.click(submit);
    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(superId, expect.objectContaining({ first_name: "Пётр", scope_ids: [managerId] })));
    expect(firstName).toHaveValue("Пётр"); expect(onClose).not.toHaveBeenCalled();
    await waitFor(() => expect(submit).not.toHaveClass("ant-btn-loading"));
    fireEvent.click(submit);
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("shows loading, empty and protected-read errors", () => {
    const { rerender } = render(<UserFormModal {...base} user={null} roles={[]} rolesLoading />);
    fireEvent.mouseDown(screen.getByRole("combobox"));
    expect(screen.getByText("Загрузка ролей…")).toBeInTheDocument();
    rerender(<UserFormModal {...base} user={null} roles={[]} rolesLoading={false} />);
    fireEvent.mouseDown(screen.getByRole("combobox"));
    expect(screen.getByText("Роли не найдены")).toBeInTheDocument();
    rerender(<UserFormModal {...base} user={null} roles={[]} rolesError="Недостаточно прав для просмотра ролей." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Недостаточно прав");
  });

  it("blocks create when the authenticated tenant is unavailable", async () => {
    const onCreate = vi.fn();
    render(<UserFormModal {...base} user={null} equestrianId={null} onCreate={onCreate} />);
    fireEvent.change(screen.getByPlaceholderText("username"), { target: { value: "new-user" } });
    fireEvent.change(screen.getByPlaceholderText("Минимум 8 символов"), { target: { value: "Password1" } });
    fireEvent.change(screen.getByPlaceholderText("Повторите пароль"), { target: { value: "Password1" } });
    fireEvent.click(screen.getByRole("button", { name: /создать/i }));
    expect(await screen.findByText("Не удалось определить текущую конюшню")).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });
});
