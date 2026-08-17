import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePageEditor } from "./usePageEditor";

const notification = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("@/hooks/useNotification", () => ({ useNotification: () => notification }));

describe("breed group Page Editor matrix", () => {
  beforeEach(() => vi.clearAllMocks());
  it("loads and saves group page_data successfully", async () => {
    const fetchPageData = vi.fn().mockResolvedValue({ status: "ok", data: { page_data: "<div>Loaded</div>" } });
    const savePageData = vi.fn().mockResolvedValue({ status: "ok", data: {} }); const onSuccess = vi.fn();
    const { result } = renderHook(() => usePageEditor({ entityId: "group-id", open: true, fetchPageData, savePageData, onSuccess }));
    await waitFor(() => expect(result.current.initialHtml).toBe("<div>Loaded</div>")); await act(() => result.current.save("<div>Saved</div>"));
    expect(savePageData).toHaveBeenCalledWith("group-id", "<div>Saved</div>"); expect(onSuccess).toHaveBeenCalled(); expect(notification.success).toHaveBeenCalled();
  });
  it.each(["load failed", "Unauthorized (401)", "Forbidden (403)"])("surfaces load error: %s", async (detail) => {
    const fetchPageData = vi.fn().mockResolvedValue({ status: "error", data: { detail } });
    const { result } = renderHook(() => usePageEditor({ entityId: "group-id", open: true, fetchPageData, savePageData: vi.fn() }));
    await waitFor(() => expect(result.current.error).toBe(detail)); expect(notification.error).toHaveBeenCalled();
  });
  it.each(["save failed", "Unauthorized (401)", "Forbidden (403)"])("retains editor state and surfaces save error: %s", async (detail) => {
    const savePageData = vi.fn().mockResolvedValue({ status: "error", data: { detail } });
    const { result } = renderHook(() => usePageEditor({ entityId: "group-id", open: true, fetchPageData: vi.fn().mockResolvedValue({ status: "ok", data: { page_data: "<div>Keep</div>" } }), savePageData }));
    await waitFor(() => expect(result.current.initialHtml).toBe("<div>Keep</div>")); await act(() => result.current.save("<div>Keep changed</div>"));
    expect(result.current.error).toBe(detail); expect(result.current.initialHtml).toBe("<div>Keep</div>"); expect(notification.success).not.toHaveBeenCalled();
  });
});
