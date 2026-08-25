import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiError, apiSuccess } from "@/lib/apiStatus";
import { useCallbackRequests } from "./useCallbackRequests";

const api = vi.hoisted(() => ({ list: vi.fn(), statuses: vi.fn(), status: vi.fn(), spam: vi.fn() }));
vi.mock("../services/callbackRequestsService", () => ({
  fetchCallbackRequests: api.list,
  fetchCallbackRequestStatuses: api.statuses,
  updateCallbackRequestStatus: api.status,
  updateCallbackRequestSpam: api.spam,
}));

describe("callback request protected mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.list.mockResolvedValue(apiSuccess({ total: 0, items: [] }));
    api.statuses.mockResolvedValue(apiSuccess([]));
    api.status.mockResolvedValue(apiSuccess({ id: "row-1" }));
    api.spam.mockResolvedValue(apiSuccess({ id: "row-1" }));
  });
  it("submits a valid narrow mutation and refreshes after success", async () => {
    const { result } = renderHook(() => useCallbackRequests());
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(1));
    await act(() => result.current.changeStatus("row-1", 2));
    expect(api.status).toHaveBeenCalledWith("row-1", { status: 2 });
    expect(api.list).toHaveBeenCalledTimes(2);
  });
  it.each(["status", "spam"] as const)("guards rapid duplicate %s mutation and allows retry after settle", async (action) => {
    let release!: (value: ReturnType<typeof apiSuccess>) => void;
    api[action].mockImplementationOnce(() => new Promise((resolve) => { release = resolve; }));
    const { result } = renderHook(() => useCallbackRequests());
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(1));
    let first!: Promise<boolean>; let second!: Promise<boolean>;
    act(() => {
      first = action === "status" ? result.current.changeStatus("row-1", 2) : result.current.changeSpam("row-1", true);
      second = action === "status" ? result.current.changeStatus("row-1", 2) : result.current.changeSpam("row-1", true);
    });
    expect(api[action]).toHaveBeenCalledTimes(1);
    expect(await second).toBe(false);
    await act(async () => { release(apiSuccess({ id: "row-1" })); await first; });
    await act(() => action === "status" ? result.current.changeStatus("row-1", 2) : result.current.changeSpam("row-1", true));
    expect(api[action]).toHaveBeenCalledTimes(2);
  });
  it("does not block a different action or row", async () => {
    const { result } = renderHook(() => useCallbackRequests());
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(1));
    await act(async () => {
      await Promise.all([result.current.changeStatus("row-1", 2), result.current.changeSpam("row-1", true), result.current.changeStatus("row-2", 2)]);
    });
    expect(api.status).toHaveBeenCalledTimes(2);
    expect(api.spam).toHaveBeenCalledTimes(1);
  });
  it("clears the key after denial, preserves error and allows retry", async () => {
    api.status.mockResolvedValueOnce(apiError("Forbidden"));
    const { result } = renderHook(() => useCallbackRequests());
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(1));
    await act(() => result.current.changeStatus("row-1", 2));
    expect(result.current.error).toBe("Forbidden");
    await act(() => result.current.changeStatus("row-1", 2));
    expect(api.status).toHaveBeenCalledTimes(2);
  });
});
