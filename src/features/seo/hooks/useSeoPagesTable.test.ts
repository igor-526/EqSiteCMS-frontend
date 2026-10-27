import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import dayjs from "dayjs";
import { message } from "antd";
import { apiError, apiSuccess } from "@/lib/apiStatus";
import type { MetricsTableOutDto } from "@/types/api/metricsTable";
import type { SeoPagesOutDto } from "@/types/api/seo";
import type { ApiResult } from "@/types/api/api";
import { fetchSeoPages } from "../services/seoDataService";
import { useSeoPagesTable } from "./useSeoPagesTable";

const context = vi.hoisted(() => ({ scopes: ["ADMIN"] as string[] }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));
vi.mock("../services/seoDataService", async importOriginal => ({
  ...await importOriginal<typeof import("../services/seoDataService")>(), fetchSeoPages: vi.fn(),
}));
const pages = vi.mocked(fetchSeoPages);
const table: MetricsTableOutDto = {
  version: 1, row_key: "id", ordering: null,
  period: { mode: "day", date_from: "2026-10-20", date_to: "2026-10-26", today: "2026-10-26",
    requested_date_from: null, requested_date_to: null, defaulted: true, adjusted: false, clamped: false },
  metric: { key: "visits", title: "Визиты", value_type: "integer" }, columns: [],
};
const row = { id: "page-id", page: "/catalog", created_at: "2026-10-23T00:00:00Z" };
const response = (metrics_table = table) => apiSuccess({ items: [row], total: 101, metrics_table });
const deferred = () => {
  let resolve!: (value: ApiResult<SeoPagesOutDto>) => void;
  const promise = new Promise<ApiResult<SeoPagesOutDto>>(done => { resolve = done; });
  return { promise, resolve };
};
async function ready() {
  const hook = renderHook(() => useSeoPagesTable(true));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}
beforeEach(() => {
  context.scopes = ["ADMIN"];
  pages.mockReset().mockImplementation(async query => response({ ...table, ordering: query?.ordering ?? null }));
  vi.spyOn(message, "warning").mockImplementation(() => ({ then: vi.fn(), promise: Promise.resolve() }) as unknown as ReturnType<typeof message.warning>);
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe("FT-PM-04..10 useSeoPagesTable", () => {
  it("FT-PM-04 first request has required defaults, no dates; server period is display-only", async () => {
    const { result } = await ready();
    expect(pages).toHaveBeenCalledExactlyOnceWith({ limit: 25, offset: 0, mode: "day", metric: "visits" });
    expect(result.current.filters).toMatchObject({ dateFrom: "2026-10-20", dateTo: "2026-10-26" });
    expect(result.current.today).toBe("2026-10-26");
    expect(result.current.disabledDate(dayjs("2026-10-27"))).toBe(true);
    expect(result.current.items).toEqual([row]);
  });
  it("FT-PM-05 mode clears dates and metric sort; metric keeps sort; dates clear metric sort", async () => {
    const { result } = await ready();
    act(() => result.current.changeSort(["-metric:2026-10-20"]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setFilters(p => ({ ...p, offset: 50 })));
    act(() => result.current.changeMetric("bounce_rate"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(pages).toHaveBeenLastCalledWith(expect.objectContaining({ metric: "bounce_rate", ordering: "-metric:2026-10-20", offset: 0 }));
    act(() => result.current.changeDates([dayjs("2026-10-01"), dayjs("2026-10-10")]));
    expect(pages).toHaveBeenLastCalledWith(expect.objectContaining({ date_from: "2026-10-01", date_to: "2026-10-10", ordering: undefined, offset: 0 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.changeSort(["metric:2026-10-20"]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const count = pages.mock.calls.length;
    act(() => result.current.changeMode("month"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(pages).toHaveBeenCalledTimes(count + 1);
    expect(pages).toHaveBeenLastCalledWith(expect.objectContaining({ mode: "month", metric: "bounce_rate", date_from: undefined, date_to: undefined, ordering: undefined, offset: 0 }));
  });
  it("FT-PM-05 preserves static sorting on mode/date changes and ignores empty/future date selection", async () => {
    const { result } = await ready();
    act(() => result.current.changeSort(["-created_at"]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.changeMode("week"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(pages).toHaveBeenLastCalledWith(expect.objectContaining({ ordering: "-created_at" }));
    const count = pages.mock.calls.length;
    act(() => result.current.changeDates(null));
    act(() => result.current.changeDates([dayjs("2027-01-01"), dayjs("2027-01-02")]));
    expect(pages).toHaveBeenCalledTimes(count);
  });
  it.each([true, false])("FT-PM-06 normalizes without refetch, warning only for clamped=%s", async clamped => {
    pages.mockResolvedValueOnce(response({ ...table, period: { ...table.period, adjusted: true, clamped, date_from: "2026-10-01", date_to: "2026-10-15" } }));
    const { result } = await ready();
    expect(result.current.filters).toMatchObject({ dateFrom: "2026-10-01", dateTo: "2026-10-15" });
    expect(pages).toHaveBeenCalledTimes(1);
    if (clamped) expect(message.warning).toHaveBeenCalledExactlyOnceWith("Диапазон сокращён до лимита «31 день»: 01.10.2026 – 15.10.2026");
    else expect(message.warning).not.toHaveBeenCalled();
  });
  it("FT-PM-07 paginates and resets offset on size/filter/sort/search, search waits 300ms", async () => {
    const { result } = await ready();
    act(() => result.current.setFilters(p => ({ ...p, offset: 25 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(pages).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 25, offset: 25 }));
    act(() => result.current.setFilters(p => ({ ...p, limit: 50, offset: 50 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(pages).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 50, offset: 0 }));
    act(() => result.current.setFilters(p => ({ ...p, offset: 50 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.useFakeTimers();
    const count = pages.mock.calls.length;
    act(() => result.current.changeSearch("  %_\\ horse  "));
    act(() => vi.advanceTimersByTime(299));
    expect(pages).toHaveBeenCalledTimes(count);
    await act(async () => vi.advanceTimersByTime(1));
    expect(result.current.searchDraft).toBe("  %_\\ horse  ");
    expect(pages).toHaveBeenLastCalledWith(expect.objectContaining({ search: "%_\\ horse", offset: 0 }));
    act(() => result.current.changeSearch("queued"));
    await act(async () => result.current.changeSearch(""));
    await act(async () => vi.advanceTimersByTime(300));
    expect(result.current.filters.search).toBeUndefined();
    expect(pages).not.toHaveBeenCalledWith(expect.objectContaining({ search: "queued" }));
  });
  it("FT-PM-08 one sort, mapping, clear and server null never refetch", async () => {
    const { result } = await ready();
    for (const value of ["page", "-page", "created_at", "-created_at", "metric:2026-10-20", "-metric:2026-10-20"]) {
      act(() => result.current.changeSort([value, "page"]));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.sort).toEqual([value]);
      expect(pages).toHaveBeenLastCalledWith(expect.objectContaining({ ordering: value, offset: 0 }));
    }
    pages.mockResolvedValueOnce(response());
    const count = pages.mock.calls.length;
    act(() => result.current.changeSort(["metric:2026-10-21"]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sort).toEqual([]);
    expect(pages).toHaveBeenCalledTimes(count + 1);
    act(() => result.current.changeSort([]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(pages).toHaveBeenLastCalledWith(expect.objectContaining({ ordering: undefined }));
  });
  it("FT-PM-09 reset preserves SEO filters/limit, clears pending draft/search/sort, one request", async () => {
    const { result } = await ready();
    act(() => result.current.changeMode("week"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.changeMetric("pageviews"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setFilters(p => ({ ...p, limit: 50, offset: 0 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.changeSort(["-metric:2026-10-20"]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.useFakeTimers();
    act(() => result.current.changeSearch(" applied "));
    await act(async () => vi.advanceTimersByTime(300));
    await act(async () => result.current.setFilters(p => ({ ...p, offset: 100 })));
    act(() => result.current.changeSearch("pending"));
    const count = pages.mock.calls.length;
    await act(async () => result.current.reset());
    await act(async () => vi.advanceTimersByTime(300));
    expect(pages).toHaveBeenCalledTimes(count + 1);
    expect(pages).toHaveBeenLastCalledWith({ mode: "week", metric: "pageviews", date_from: "2026-10-20", date_to: "2026-10-26", limit: 50, offset: 0, search: undefined, ordering: undefined });
    expect(result.current.searchDraft).toBe("");
    expect(result.current.sort).toEqual([]);
  });
  it("FT-PM-10 ignores stale responses including periods, errors and warnings", async () => {
    const old = deferred();
    pages.mockReturnValueOnce(old.promise);
    const { result } = renderHook(() => useSeoPagesTable(true));
    act(() => result.current.changeMetric("users"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => old.resolve(response({ ...table, period: { ...table.period, clamped: true, date_from: "2000-01-01" } })));
    expect(result.current.filters.dateFrom).toBe("2026-10-20");
    expect(message.warning).not.toHaveBeenCalled();
    expect(result.current.filters.metric).toBe("users");
  });
  it("FT-PM-10 scope missing/revoked and inactive prevent requests/actions/late writes", async () => {
    context.scopes = ["SUPERUSER", "DEVELOPER"];
    const { result, rerender } = renderHook(({ active }) => useSeoPagesTable(active), { initialProps: { active: true } });
    act(() => { result.current.changeMode("month"); result.current.changeSearch("x"); result.current.reset(); result.current.retry(); });
    expect(pages).not.toHaveBeenCalled();
    context.scopes = ["ADMIN"];
    const pending = deferred();
    pages.mockReturnValueOnce(pending.promise);
    rerender({ active: true });
    expect(pages).toHaveBeenCalledTimes(1);
    context.scopes = [];
    rerender({ active: true });
    await act(async () => pending.resolve(response()));
    expect(result.current.items).toEqual([]);
    expect(result.current.metricsTable).toBeNull();
    context.scopes = ["ADMIN"];
    rerender({ active: false });
    act(() => result.current.changeSort(["page"]));
    expect(pages).toHaveBeenCalledTimes(1);
  });
  it("shows error distinct from empty success and retries rejected promises", async () => {
    pages.mockResolvedValueOnce(apiError("Недостаточно прав"));
    const { result } = await ready();
    expect(result.current.error).toBe("Недостаточно прав");
    pages.mockRejectedValueOnce(new Error("network"));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Не удалось загрузить данные SEO");
    pages.mockResolvedValueOnce(apiSuccess({ items: [], total: 0, metrics_table: table }));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.items).toEqual([]);
  });
});
