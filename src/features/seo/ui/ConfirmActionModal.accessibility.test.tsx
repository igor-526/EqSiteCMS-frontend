import { StrictMode, useState } from "react";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { ConfirmActionModal } from "./ConfirmActionModal";

const onConfirm = vi.fn();
function Harness({ entityKey = "counter-a", pending = false, error, triggerVisible = true, triggerDisabled = false }: {
  entityKey?: string; pending?: boolean; error?: string; triggerVisible?: boolean; triggerDisabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const show = () => setOpen(true);
  const close = () => setOpen(false);
  return <>
    {triggerVisible && <button disabled={triggerDisabled} onClick={show}>Отвязать объект</button>}
    <ConfirmActionModal open={open} title="Отвязать объект?" text="Подтверждение" consequences={["Статистика"]}
      entityKey={entityKey} confirmationDelayMs={5000} pending={pending} error={error} onConfirm={onConfirm} onCancel={close} />
  </>;
}

describe("FIX-F-01 accessible content and focus return", () => {
  it("names the scroll region, adds an explicit Tab stop and retains the long-error scroll bounds/deadline", async () => {
    const error = "Длинная безопасная ошибка ".repeat(100);
    renderWithCmsProviders(<Harness error={error} />);
    await userEvent.click(screen.getByRole("button", { name: "Отвязать объект" }));
    const dialog = screen.getByRole("dialog");
    const region = within(dialog).getByRole("region", { name: "Содержание: Отвязать объект?" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveTextContent(error.trim());
    expect(getComputedStyle(region).overflowY).toBe("auto");
    expect(getComputedStyle(region).maxHeight).toBe("calc(100vh - 240px)");
    within(dialog).getByRole("button", { name: "Close" }).focus();
    await userEvent.tab();
    expect(region).toHaveFocus();
    await userEvent.tab();
    expect(within(dialog).getByRole("button", { name: "Отмена" })).toHaveFocus();
    const confirm = within(dialog).getByRole("button", { name: /Подтвердить \(/ });
    expect(confirm).toBeDisabled();
    onConfirm.mockClear();
    await userEvent.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it.each(["cancel", "close", "escape"])("restores the connected opener on %s without custom focus trapping", async (action) => {
    renderWithCmsProviders(<Harness />);
    const opener = screen.getByRole("button", { name: "Отвязать объект" });
    await userEvent.click(opener);
    if (action === "escape") fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape", code: "Escape", keyCode: 27 });
    else await userEvent.click(screen.getByRole("button", { name: action === "cancel" ? "Отмена" : "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
    await userEvent.click(opener);
    expect(screen.getByRole("button", { name: "Подтвердить (5)" })).toBeDisabled();
  });

  it("keeps the original opener across entity remount and does not restore during StrictMode setup", async () => {
    const { rerender } = renderWithCmsProviders(<StrictMode><Harness /></StrictMode>);
    const opener = screen.getByRole("button", { name: "Отвязать объект" });
    await userEvent.click(opener);
    screen.getByRole("region").focus();
    await act(async () => {});
    expect(opener).not.toHaveFocus();
    rerender(<StrictMode><Harness entityKey="counter-b" /></StrictMode>);
    await act(async () => {});
    expect(opener).not.toHaveFocus();
    expect(screen.getByRole("button", { name: "Подтвердить (5)" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(opener).toHaveFocus();
  });

  it.each(["removed", "disabled"])("does not focus an opener that was %s while the modal was open", async (state) => {
    const { rerender } = renderWithCmsProviders(<Harness />);
    const opener = screen.getByRole("button", { name: "Отвязать объект" });
    await userEvent.click(opener);
    const focus = vi.spyOn(opener, "focus");
    rerender(<Harness triggerVisible={state !== "removed"} triggerDisabled={state === "disabled"} />);
    await userEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(focus).not.toHaveBeenCalled();
    focus.mockRestore();
  });

  it("keeps pending cancellation disabled while the content remains focusable", async () => {
    const { rerender } = renderWithCmsProviders(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Отвязать объект" }));
    rerender(<Harness pending />);
    const region = screen.getByRole("region");
    region.focus();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape", code: "Escape", keyCode: 27 });
    expect(region).toHaveFocus();
    expect(screen.getByRole("button", { name: "Отмена" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Подтвердить/ })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });
});
