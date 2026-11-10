import { createElement, StrictMode, type ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiError, apiSuccess } from "@/lib/apiStatus";
import type { ApiResult } from "@/types/api/api";
import type { MetricaTasksOutDto } from "@/types/api/seo";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { fetchMetricaTasks, METRICA_TASKS_ERROR } from "../services/metricaTasksService";
import { useMetricaTasks } from "./useMetricaTasks";

const context = vi.hoisted(() => ({ scopes: ["SEO"] as KNOWN_USER_SCOPES[] }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));
vi.mock("../services/metricaTasksService", () => ({ fetchMetricaTasks: vi.fn(), METRICA_TASKS_ERROR: "Ошибка задач" }));
const request = vi.mocked(fetchMetricaTasks);
const rows: MetricaTasksOutDto["items"] = [
  { id: "merge:older", type: "merge", status: "running", is_active: true, created_at: "2026-10-01T00:00:00Z" },
  { id: "parsing:newer", type: "parsing", status: "failed", is_active: false, created_at: "2026-11-06T00:00:00Z" },
];
const initial = { open: true, bindingKey: "account:counter:generation-1" as string | null };
const success = (total = 100, items = rows) => apiSuccess({ items, total });
function deferred() {
  let resolve!: (value: ApiResult<MetricaTasksOutDto>) => void;
  const promise = new Promise<ApiResult<MetricaTasksOutDto>>(done => { resolve = done; });
  return { promise, resolve };
}
beforeEach(() => {
  vi.resetAllMocks();
  context.scopes = [KNOWN_USER_SCOPES.SEO];
  request.mockResolvedValue(success());
});

async function settled(result: { current: ReturnType<typeof useMetricaTasks> }) {
  await waitFor(() => expect(result.current.loading).toBe(false));
}

describe("FE-02..06 Metrica task lifecycle and pagination", () => {
  it("opens safely under StrictMode effect replay", async () => {
    const wrapper = ({ children }: { children: ReactNode }) => createElement(StrictMode, null, children);
    const { result } = renderHook(useMetricaTasks, { initialProps: initial, wrapper });
    await waitFor(() => expect(result.current.items).toEqual(rows));
    expect(request).toHaveBeenCalledExactlyOnceWith({ limit: 20, offset: 0 });
  });
  it("one initial 20/0 load, server order retained; no polling", async () => {
    const { result } = renderHook(useMetricaTasks, { initialProps: initial });
    await waitFor(() => expect(result.current.items).toEqual(rows));
    expect(request).toHaveBeenCalledExactlyOnceWith({ limit: 20, offset: 0 });
    expect(result.current.total).toBe(100);
    vi.useFakeTimers();
    try { await act(async () => { vi.advanceTimersByTime(300_000); }); }
    finally { vi.useRealTimers(); }
    expect(request).toHaveBeenCalledOnce();
  });
  it("page, reload/retry retain pagination; size resets offset; accepted reload once at zero", async () => {
    const { result } = renderHook(useMetricaTasks, { initialProps: initial });
    await waitFor(() => expect(result.current.items).toEqual(rows));
    act(() => result.current.setOffset(20));
    await settled(result);
    expect(request).toHaveBeenLastCalledWith({ limit: 20, offset: 20 });
    act(() => result.current.reload());
    await settled(result);
    expect(request).toHaveBeenLastCalledWith({ limit: 20, offset: 20 });
    act(() => result.current.setLimit(50));
    await settled(result);
    expect(request).toHaveBeenLastCalledWith({ limit: 50, offset: 0 });
    act(() => result.current.setLimit(100));
    await settled(result);
    expect(request).toHaveBeenLastCalledWith({ limit: 100, offset: 0 });
    act(() => result.current.setOffset(100));
    await settled(result);
    request.mockClear();
    act(() => result.current.reloadFromStart());
    await settled(result);
    expect(request).toHaveBeenCalledExactlyOnceWith({ limit: 100, offset: 0 });
  });
  it("reopen resets 20/0 and clears prior data while closed", async () => {
    const { result, rerender } = renderHook(useMetricaTasks, { initialProps: initial });
    await waitFor(() => expect(result.current.items).toEqual(rows));
    act(() => result.current.setLimit(50));
    await settled(result);
    rerender({ ...initial, open: false });
    expect(result.current.items).toEqual([]);
    rerender(initial);
    await settled(result);
    expect(request).toHaveBeenLastCalledWith({ limit: 20, offset: 0 });
  });
  it("corrects out-of-range nonempty total at most once even if total shrinks again", async () => {
    const { result } = renderHook(useMetricaTasks, { initialProps: initial });
    await waitFor(() => expect(result.current.items).toEqual(rows));
    request.mockResolvedValueOnce(success(21, [])).mockResolvedValueOnce(success(1, []));
    act(() => result.current.setOffset(80));
    await waitFor(() => expect(result.current.total).toBe(1));
    expect(request.mock.calls.map(([query]) => query)).toEqual([
      { limit: 20, offset: 0 }, { limit: 20, offset: 80 }, { limit: 20, offset: 20 },
    ]);
  });
  it("empty total resets offset to zero without a second GET", async () => {
    const { result } = renderHook(useMetricaTasks, { initialProps: initial });
    await waitFor(() => expect(result.current.items).toEqual(rows));
    request.mockResolvedValue(success(0, []));
    act(() => result.current.setOffset(80));
    await waitFor(() => expect(result.current.offset).toBe(0));
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.loading).toBe(false);
    expect(request).toHaveBeenCalledTimes(2);
    act(() => result.current.retry());
    await settled(result);
    expect(request).toHaveBeenCalledTimes(3);
  });
  it.each([401, 403, 400, 502])("HTTP %s is error, retry explicit and preserves page", async httpStatus => {
    const { result } = renderHook(useMetricaTasks, { initialProps: initial });
    await waitFor(() => expect(result.current.items).toEqual(rows));
    request.mockResolvedValue({ ...apiError("Безопасная ошибка"), httpStatus });
    act(() => result.current.setOffset(20));
    await waitFor(() => expect(result.current.error).toBe("Безопасная ошибка"));
    expect(result.current.items).toEqual([]);
    expect(request).toHaveBeenCalledTimes(2);
    request.mockResolvedValue(success());
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.items).toEqual(rows));
    expect(request).toHaveBeenLastCalledWith({ limit: 20, offset: 20 });
  });
  it("thrown failure is safe and not retried", async () => {
    request.mockRejectedValue(new Error("private"));
    const { result } = renderHook(useMetricaTasks, { initialProps: initial });
    await waitFor(() => expect(result.current.error).toBe(METRICA_TASKS_ERROR));
    expect(request).toHaveBeenCalledOnce();
  });
  it.each([null, "counter"])("no request/mutation without permission or binding: %s", async bindingKey => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    const { result, rerender } = renderHook(useMetricaTasks, { initialProps: { ...initial, bindingKey } });
    act(() => { result.current.reload(); result.current.reloadFromStart(); result.current.setLimit(50); result.current.setOffset(20); });
    expect(result.current.active).toBe(false);
    expect(request).not.toHaveBeenCalled();
    context.scopes = [KNOWN_USER_SCOPES.SEO];
    rerender({ open: false, bindingKey: null });
    rerender({ open: true, bindingKey: null });
    expect(request).not.toHaveBeenCalled();
  });
  it("page change ignores a late previous-page response", async () => {
    const old = deferred();
    request.mockReturnValueOnce(old.promise);
    const { result } = renderHook(useMetricaTasks, { initialProps: initial });
    await waitFor(() => expect(result.current.loading).toBe(true));
    act(() => result.current.setOffset(20));
    await waitFor(() => expect(result.current.items).toEqual(rows));
    await act(async () => old.resolve(success(999, [])));
    expect(result.current.total).toBe(100);
    expect(result.current.items).toEqual(rows);
  });
  it.each(["close", "revoke", "binding", "unmount"])("invalidates pending read on %s; saved callbacks guarded", async change => {
    const pending = deferred();
    request.mockReturnValueOnce(pending.promise);
    const { result, rerender, unmount } = renderHook(useMetricaTasks, { initialProps: initial });
    await waitFor(() => expect(result.current.loading).toBe(true));
    const saved = result.current;
    if (change === "unmount") unmount();
    else if (change === "revoke") { context.scopes = []; rerender(initial); }
    else rerender({ ...initial, open: change !== "close", bindingKey: change === "binding" ? "other" : initial.bindingKey });
    await act(async () => pending.resolve(success(999)));
    if (change !== "unmount") {
      expect(result.current.active).toBe(false);
      expect(result.current.items).toEqual([]);
      act(() => { saved.retry(); saved.reloadFromStart(); saved.setOffset(20); saved.setLimit(50); });
      expect(request).toHaveBeenCalledOnce();
      rerender({ ...initial, open: false });
      context.scopes = [KNOWN_USER_SCOPES.SEO];
      rerender({ ...initial, bindingKey: "new" });
      await settled(result);
      expect(request).toHaveBeenLastCalledWith({ limit: 20, offset: 0 });
    }
  });
});
