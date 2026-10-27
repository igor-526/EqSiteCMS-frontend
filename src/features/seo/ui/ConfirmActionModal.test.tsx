import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { ConfirmActionModal } from "./ConfirmActionModal";

const props = {
  open: true, title: "Подтверждение", text: "Проверка", pending: false,
  onConfirm: vi.fn(), onCancel: vi.fn(),
};

describe("FE-1.6 ConfirmActionModal compatibility", () => {
  it("keeps default confirm label and danger style for unlink", () => {
    renderWithCmsProviders(<ConfirmActionModal {...props} />);
    const confirm = within(screen.getByRole("dialog")).getByRole("button", { name: "Подтвердить" });
    expect(confirm).toHaveClass("ant-btn-dangerous");
  });

  it("accepts non-danger confirm and custom label", async () => {
    const onConfirm = vi.fn();
    renderWithCmsProviders(<ConfirmActionModal {...props} okText="Запустить" okDanger={false} onConfirm={onConfirm} />);
    const confirm = screen.getByRole("button", { name: "Запустить" });
    expect(confirm).not.toHaveClass("ant-btn-dangerous");
    await userEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("FE-FIX-2 applies an opt-in class only to confirm without changing danger defaults", () => {
    renderWithCmsProviders(<ConfirmActionModal {...props} okClassName="refresh-only" okDanger={false} />);
    expect(screen.getByRole("button", { name: "Подтвердить" })).toHaveClass("refresh-only");
    expect(screen.getByRole("button", { name: "Подтвердить" })).not.toHaveClass("ant-btn-dangerous");
    expect(screen.getByRole("button", { name: "Отмена" })).not.toHaveClass("refresh-only");
  });

  it("blocks both buttons and closing while pending", () => {
    renderWithCmsProviders(<ConfirmActionModal {...props} pending />);
    expect(screen.getByRole("button", { name: /Подтвердить/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Отмена" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("cancel does not confirm", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderWithCmsProviders(<ConfirmActionModal {...props} onConfirm={onConfirm} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("does not render a closed modal", () => {
    renderWithCmsProviders(<ConfirmActionModal {...props} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
