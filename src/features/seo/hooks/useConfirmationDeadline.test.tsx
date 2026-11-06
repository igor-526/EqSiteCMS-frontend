import { act, fireEvent, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { ConfirmActionModal } from "../ui/ConfirmActionModal";
import { useConfirmationDeadline } from "./useConfirmationDeadline";

const props = {
  open: true, title: "Подтверждение", text: "Проверка", pending: false,
  confirmationDelayMs: 5000, onConfirm: vi.fn(), onCancel: vi.fn(),
};

describe("FE-01..04 deadline confirmation", () => {
  afterEach(() => vi.useRealTimers());

  it("FE-01/02/12 lists losses and recovery, blocks Enter/click until exactly 5000ms", async () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    renderWithCmsProviders(<ConfirmActionModal {...props} entityKey="counter-1"
      consequences={["Статистика страниц", "Статистика запросов"]} recovery="Повторно привяжите счётчик" onConfirm={onConfirm} />);
    expect(screen.getByRole("list", { name: "Последствия удаления" })).toHaveTextContent("Статистика страниц");
    expect(screen.getByText("Повторно привяжите счётчик")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Подтвердить (5)" });
    fireEvent.click(button);
    fireEvent.keyDown(button, { key: "Enter" });
    await act(() => vi.advanceTimersByTimeAsync(4999));
    expect(screen.getByRole("button", { name: "Подтвердить (1)" })).toBeDisabled();
    expect(onConfirm).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(screen.getByRole("button", { name: "Подтвердить" })).toBeEnabled();
    fireEvent.click(button);
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("FE-01/04 resets on close/reopen and entity change", async () => {
    vi.useFakeTimers();
    const { rerender } = renderWithCmsProviders(<ConfirmActionModal {...props} entityKey="a" />);
    await act(() => vi.advanceTimersByTimeAsync(4000));
    expect(screen.getByRole("button", { name: "Подтвердить (1)" })).toBeDisabled();
    rerender(<ConfirmActionModal {...props} entityKey="b" />);
    expect(screen.getByRole("button", { name: "Подтвердить (5)" })).toBeDisabled();
    rerender(<ConfirmActionModal {...props} open={false} entityKey="b" />);
    rerender(<ConfirmActionModal {...props} entityKey="b" />);
    expect(screen.getByRole("button", { name: "Подтвердить (5)" })).toBeDisabled();
  });

  it("FE-02/03 guards programmatic calls, pending, latest permission and synchronous double submission", async () => {
    vi.useFakeTimers();
    let release!: () => void;
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => { release = resolve; }));
    const { result, rerender } = renderHook(({ disabled, pending }) => useConfirmationDeadline({
      delayMs: 5000, disabled, pending, onConfirm,
    }), { initialProps: { disabled: false, pending: false } });
    const staleConfirm = result.current.confirm;
    await act(() => staleConfirm());
    await act(() => vi.advanceTimersByTimeAsync(4999));
    await act(() => staleConfirm());
    expect(onConfirm).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(1));
    rerender({ disabled: true, pending: false });
    await act(() => staleConfirm());
    rerender({ disabled: false, pending: true });
    await act(() => staleConfirm());
    expect(onConfirm).not.toHaveBeenCalled();
    rerender({ disabled: false, pending: false });
    let request!: Promise<void>;
    act(() => { request = staleConfirm(); void staleConfirm(); });
    expect(onConfirm).toHaveBeenCalledOnce();
    await act(async () => { release(); await request; });
  });

  it("FE-02/04 uses absolute time and cleans interval/stale callback on unmount", async () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    const { result, unmount } = renderHook(() => useConfirmationDeadline({ delayMs: 5000, disabled: false, pending: false, onConfirm }));
    const staleConfirm = result.current.confirm;
    expect(vi.getTimerCount()).toBe(1);
    vi.setSystemTime(Date.now() + 10000);
    await act(() => vi.advanceTimersByTimeAsync(100));
    expect(result.current.remaining).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    unmount();
    await act(() => staleConfirm());
    expect(onConfirm).not.toHaveBeenCalled();
    const next = renderHook(() => useConfirmationDeadline({ delayMs: 5000, disabled: false, pending: false, onConfirm }));
    expect(vi.getTimerCount()).toBe(1);
    next.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("releases the local lock after error so a manual retry is possible", async () => {
    const onConfirm = vi.fn(async () => {}).mockRejectedValueOnce(new Error("network"));
    const { result } = renderHook(() => useConfirmationDeadline({ delayMs: 0, disabled: false, pending: false, onConfirm }));
    await expect(result.current.confirm()).rejects.toThrow("network");
    await result.current.confirm();
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });
});
