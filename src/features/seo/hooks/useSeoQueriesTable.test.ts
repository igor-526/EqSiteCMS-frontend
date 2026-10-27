import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import dayjs from "dayjs";
import { message } from "antd";
import { apiError, apiSuccess } from "@/lib/apiStatus";
import type { MetricsTableOutDto } from "@/types/api/metricsTable";
import type { SeoSearchQueriesOutDto } from "@/types/api/seo";
import type { ApiResult } from "@/types/api/api";
import { fetchSeoSearchQueries } from "../services/seoDataService";
import { useSeoQueriesTable } from "./useSeoQueriesTable";

const context = vi.hoisted(() => ({ scopes: ["ADMIN"] as string[] }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));
vi.mock("../services/seoDataService", async importOriginal => ({
  ...await importOriginal<typeof import("../services/seoDataService")>(), fetchSeoSearchQueries: vi.fn(),
}));
const queries = vi.mocked(fetchSeoSearchQueries);
const table: MetricsTableOutDto = {
  version: 1, row_key: "id", ordering: null,
  period: { mode: "day", date_from: "2026-10-20", date_to: "2026-10-26", today: "2026-10-26",
    requested_date_from: null, requested_date_to: null, defaulted: true, adjusted: false, clamped: false },
  metric: { key: "visits", title: "Визиты", value_type: "integer" }, columns: [],
};
const row = { id: "query-id", query: "конь", created_at: "2026-10-23T00:00:00Z" };
const response = (metrics_table = table) => apiSuccess({ items: [row], total: 101, metrics_table });
const deferred = () => {
  let resolve!: (value: ApiResult<SeoSearchQueriesOutDto>) => void;
  const promise = new Promise<ApiResult<SeoSearchQueriesOutDto>>(done => { resolve = done; });
  return { promise, resolve };
};
async function ready() {
  const hook = renderHook(() => useSeoQueriesTable(true));
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}
beforeEach(() => {
  context.scopes = ["ADMIN"];
  queries.mockReset().mockImplementation(async query => response({ ...table, ordering: query?.ordering ?? null }));
  vi.spyOn(message, "warning").mockImplementation(() => ({ then: vi.fn(), promise: Promise.resolve() }) as unknown as ReturnType<typeof message.warning>);
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe("FT-QM-02..07/09 useSeoQueriesTable", () => {
  it("FT-QM-03/04 first request has required defaults, no dates; server period is display-only", async () => {
    const { result } = await ready();
    expect(queries).toHaveBeenCalledExactlyOnceWith({ limit: 25, offset: 0, mode: "day", metric: "visits" });
    expect(result.current.filters).toMatchObject({ dateFrom: "2026-10-20", dateTo: "2026-10-26" });
    expect(result.current.today).toBe("2026-10-26");
    expect(result.current.disabledDate(dayjs("2026-10-27"))).toBe(true);
    expect(result.current.items).toEqual([row]);
  });
  it("FT-QM-03/07 mode clears dates and metric sort; metric keeps sort; dates clear metric sort", async () => {
    const { result } = await ready();
    act(() => result.current.changeSort(["-metric:2026-10-20"]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setFilters(p => ({ ...p, offset: 50 })));
    act(() => result.current.changeMetric("bounce_rate"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ metric: "bounce_rate", ordering: "-metric:2026-10-20", offset: 0 }));
    act(() => result.current.setFilters(previous => ({ ...previous, offset: 50 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.changeDates([dayjs("2026-10-01"), dayjs("2026-10-10")]));
    expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ date_from: "2026-10-01", date_to: "2026-10-10", ordering: undefined, offset: 0 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.changeSort(["metric:2026-10-20"]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setFilters(previous => ({ ...previous, offset: 25 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const count = queries.mock.calls.length;
    act(() => result.current.changeMode("month"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(queries).toHaveBeenCalledTimes(count + 1);
    expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ mode: "month", metric: "bounce_rate", date_from: undefined, date_to: undefined, ordering: undefined, offset: 0 }));
  });
  it("FT-QM-03/07 preserves static sorting on mode/date changes and ignores empty/future date selection", async () => {
    const { result } = await ready();
    act(() => result.current.changeSort(["-created_at"]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.changeMode("week"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ ordering: "-created_at" }));
    const count = queries.mock.calls.length;
    act(() => result.current.changeDates(null));
    act(() => result.current.changeDates([dayjs("2027-01-01"), dayjs("2027-01-02")]));
    expect(queries).toHaveBeenCalledTimes(count);
  });
  it.each([true, false])("FT-QM-03 normalizes without refetch, warning only for clamped=%s", async clamped => {
    queries.mockResolvedValueOnce(response({ ...table, period: { ...table.period, adjusted: true, clamped, date_from: "2026-10-01", date_to: "2026-10-15" } }));
    const { result } = await ready();
    expect(result.current.filters).toMatchObject({ dateFrom: "2026-10-01", dateTo: "2026-10-15" });
    expect(queries).toHaveBeenCalledTimes(1);
    if (clamped) expect(message.warning).toHaveBeenCalledExactlyOnceWith("Диапазон сокращён до лимита «31 день»: 01.10.2026 – 15.10.2026");
    else expect(message.warning).not.toHaveBeenCalled();
  });
  it("FT-QM-02/04..07 paginates and resets offset on size/filter/sort/search, search waits 300ms", async () => {
    const { result } = await ready();
    act(() => result.current.setFilters(p => ({ ...p, offset: 25 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 25, offset: 25 }));
    act(() => result.current.setFilters(p => ({ ...p, limit: 50, offset: 50 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 50, offset: 0 }));
    act(() => result.current.setFilters(p => ({ ...p, offset: 50 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.useFakeTimers();
    const count = queries.mock.calls.length;
    act(() => result.current.changeSearch("  %_\\ horse  "));
    act(() => vi.advanceTimersByTime(299));
    expect(queries).toHaveBeenCalledTimes(count);
    await act(async () => vi.advanceTimersByTime(1));
    expect(result.current.searchDraft).toBe("  %_\\ horse  ");
    expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ search: "%_\\ horse", offset: 0 }));
    act(() => result.current.changeSearch("queued"));
    await act(async () => result.current.changeSearch(""));
    await act(async () => vi.advanceTimersByTime(300));
    expect(result.current.filters.search).toBeUndefined();
    expect(queries).not.toHaveBeenCalledWith(expect.objectContaining({ search: "queued" }));
  });
  it("FT-QM-02/03 one sort, mapping, clear and server null never refetch", async () => {
    const { result } = await ready();
    for (const value of ["query", "-query", "created_at", "-created_at", "metric:2026-10-20", "-metric:2026-10-20"]) {
      act(() => result.current.setFilters(previous => ({ ...previous, offset: 25 })));
      await waitFor(() => expect(result.current.loading).toBe(false));
      act(() => result.current.changeSort([value, "query"]));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.sort).toEqual([value]);
      expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ ordering: value, offset: 0 }));
    }
    queries.mockResolvedValueOnce(response());
    const count = queries.mock.calls.length;
    act(() => result.current.changeSort(["metric:2026-10-21"]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sort).toEqual([]);
    expect(queries).toHaveBeenCalledTimes(count + 1);
    act(() => result.current.changeSort([]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ ordering: undefined }));
  });
  it("FT-QM-02/07 reset preserves SEO filters/limit, clears pending draft/search/sort, one request", async () => {
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
    const count = queries.mock.calls.length;
    await act(async () => result.current.reset());
    await act(async () => vi.advanceTimersByTime(300));
    expect(queries).toHaveBeenCalledTimes(count + 1);
    expect(queries).toHaveBeenLastCalledWith({ mode: "week", metric: "pageviews", date_from: "2026-10-20", date_to: "2026-10-26", limit: 50, offset: 0, search: undefined, ordering: undefined });
    expect(result.current.searchDraft).toBe("");
    expect(result.current.sort).toEqual([]);
  });
  it("FT-QM-09 ignores stale responses including periods, errors and warnings", async () => {
    const old = deferred();
    queries.mockReturnValueOnce(old.promise);
    const { result } = renderHook(() => useSeoQueriesTable(true));
    act(() => result.current.changeMetric("users"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => old.resolve(response({ ...table, period: { ...table.period, clamped: true, date_from: "2000-01-01" } })));
    expect(result.current.filters.dateFrom).toBe("2026-10-20");
    expect(message.warning).not.toHaveBeenCalled();
    expect(result.current.filters.metric).toBe("users");
  });
  it("FT-QM-09 scope missing/revoked and inactive prevent requests/actions/late writes", async () => {
    context.scopes = ["SUPERUSER", "DEVELOPER"];
    const { result, rerender } = renderHook(({ active }) => useSeoQueriesTable(active), { initialProps: { active: true } });
    act(() => { result.current.changeMode("month"); result.current.changeSearch("x"); result.current.reset(); result.current.retry(); });
    expect(queries).not.toHaveBeenCalled();
    context.scopes = ["ADMIN"];
    const pending = deferred();
    queries.mockReturnValueOnce(pending.promise);
    rerender({ active: true });
    expect(queries).toHaveBeenCalledTimes(1);
    context.scopes = [];
    rerender({ active: true });
    await act(async () => pending.resolve(response()));
    expect(result.current.items).toEqual([]);
    expect(result.current.metricsTable).toBeNull();
    context.scopes = ["ADMIN"];
    rerender({ active: false });
    act(() => result.current.changeSort(["query"]));
    expect(queries).toHaveBeenCalledTimes(1);
  });
  it("shows error distinct from empty success and retries rejected promises", async () => {
    queries.mockResolvedValueOnce(apiError("Недостаточно прав"));
    const { result } = await ready();
    expect(result.current.error).toBe("Недостаточно прав");
    queries.mockRejectedValueOnce(new Error("network"));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Не удалось загрузить данные SEO");
    queries.mockResolvedValueOnce(apiSuccess({ items: [], total: 0, metrics_table: table }));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.items).toEqual([]);
  });
});


describe("FT-QM query guards and edge transitions", () => {
  it("FT-QM-05/06 deduplicates both size callbacks and repeated page callbacks", async () => {
    const { result } = await ready();
    act(() => result.current.setFilters(previous => ({ ...previous, offset: 75 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const count = queries.mock.calls.length;
    // TablePaginator/AntD invokes onShowSizeChange and onChange in one event.
    act(() => {
      result.current.setFilters(previous => ({ ...previous, limit: 50, offset: 0 }));
      result.current.setFilters(previous => ({ ...previous, limit: 50, offset: 150 }));
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(queries).toHaveBeenCalledTimes(count + 1);
    expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 50, offset: 0 }));
    act(() => {
      result.current.setFilters(previous => ({ ...previous, offset: 50 }));
      result.current.setFilters(previous => ({ ...previous, offset: 50 }));
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(queries).toHaveBeenCalledTimes(count + 2);
    expect(result.current.total).toBe(101);
    expect(result.current.filters).toMatchObject({ limit: 50, offset: 50 });
    act(() => result.current.setFilters(previous => ({ ...previous })));
    expect(queries).toHaveBeenCalledTimes(count + 2);
  });
  it.each([
    ["day", "2026-10-26", "2026-10-27"],
    ["week", "2026-11-01", "2026-11-02"],
    ["month", "2026-10-31", "2026-11-01"],
    ["year", "2026-12-31", "2027-01-01"],
  ] as const)("FT-QM-03 %s defaults and today come from server without a second fetch", async (mode, currentUnit, futureUnit) => {
    const { result } = await ready();
    queries.mockResolvedValueOnce(response({ ...table, period: { ...table.period, mode, date_from: "2026-01-01" } }));
    const count = queries.mock.calls.length;
    act(() => result.current.changeMode(mode));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(queries).toHaveBeenCalledTimes(count + 1);
    expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ mode, date_from: undefined, date_to: undefined, offset: 0 }));
    expect(result.current.filters.dateFrom).toBe("2026-01-01");
    expect(result.current.disabledDate(dayjs(currentUnit))).toBe(false);
    expect(result.current.disabledDate(dayjs(futureUnit))).toBe(true);
  });
  it.each(["users", "pageviews", "bounces", "bounce_rate", "page_depth", "avg_visit_duration_seconds", "visit_duration_seconds", "visits"] as const)("FT-QM-03/07 metric %s preserves dates/sort and resets offset", async metric => {
    const { result } = await ready();
    act(() => result.current.changeSort(["metric:2026-10-20"]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setFilters(previous => ({ ...previous, offset: 50 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.changeMetric(metric));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ metric, offset: 0, ordering: "metric:2026-10-20", date_from: "2026-10-20", date_to: "2026-10-26" }));
  });
  it("FT-QM-02 immediate clear preserves sort/limit, whitespace remains draft only", async () => {
    const { result } = await ready();
    act(() => result.current.changeSort(["-created_at"]));
    act(() => result.current.setFilters(previous => ({ ...previous, limit: 50, offset: 0 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.useFakeTimers();
    act(() => result.current.changeSearch(" applied "));
    await act(async () => vi.advanceTimersByTime(300));
    act(() => result.current.changeSearch("pending"));
    const count = queries.mock.calls.length;
    await act(async () => result.current.changeSearch(""));
    await act(async () => vi.advanceTimersByTime(300));
    expect(queries).toHaveBeenCalledTimes(count + 1);
    expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ search: undefined, offset: 0, ordering: "-created_at", limit: 50 }));
    act(() => result.current.changeSearch("   "));
    await act(async () => vi.advanceTimersByTime(300));
    expect(result.current.searchDraft).toBe("   ");
    expect(result.current.filters.search).toBeUndefined();
    expect(queries).toHaveBeenCalledTimes(count + 1);
  });
  it.each(["No session", "Forbidden", "Invalid query", "Downstream unavailable"])("FT-QM-09 error %s retains filters for retry", async detail => {
    const { result } = await ready();
    queries.mockResolvedValueOnce(apiError(detail));
    act(() => result.current.changeMetric("users"));
    await waitFor(() => expect(result.current.error).toBe(detail));
    const filters = result.current.filters;
    const request = queries.mock.lastCall?.[0];
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.filters).toEqual(filters);
    expect(queries).toHaveBeenLastCalledWith(request);
  });
  it.each([false, true])("FT-QM-09 ignores stale success/error=%s", async error => {
    const old = deferred();
    queries.mockReturnValueOnce(old.promise);
    const { result } = renderHook(() => useSeoQueriesTable(true));
    act(() => result.current.changeSort(["-query"]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => old.resolve(error ? apiError("stale error") : apiSuccess({ items: [], total: 0, metrics_table: { ...table, ordering: "created_at" } })));
    expect(result.current.items).toEqual([row]);
    expect(result.current.total).toBe(101);
    expect(result.current.sort).toEqual(["-query"]);
    expect(result.current.error).toBeNull();
  });
  it.each(["inactive", "revoked", "unmount"])("FT-QM-09 cancels pending debounce and late response on %s", async action => {
    const old = deferred();
    queries.mockReturnValueOnce(old.promise);
    const { result, rerender, unmount } = renderHook(({ active }) => useSeoQueriesTable(active), { initialProps: { active: true } });
    vi.useFakeTimers();
    act(() => result.current.changeSearch(" pending "));
    if (action === "unmount") unmount();
    else {
      if (action === "revoked") context.scopes = [];
      rerender({ active: action !== "inactive" });
    }
    await act(async () => {
      old.resolve(response({ ...table, period: { ...table.period, clamped: true } }));
      vi.advanceTimersByTime(300);
    });
    expect(queries).toHaveBeenCalledTimes(1);
    expect(result.current.items).toEqual([]);
    expect(result.current.metricsTable).toBeNull();
    expect(message.warning).not.toHaveBeenCalled();
  });
  it("FT-QM-09 keeps visited state on tab switch, resumes draft, rejects old period", async () => {
    const { result, rerender } = renderHook(({ active }) => useSeoQueriesTable(active), { initialProps: { active: true } });
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.changeSort(["-created_at"]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const old = deferred();
    queries.mockReturnValueOnce(old.promise);
    act(() => result.current.setFilters(previous => ({ ...previous, offset: 25 })));
    vi.useFakeTimers();
    act(() => result.current.changeSearch(" draft "));
    await act(async () => rerender({ active: false }));
    await act(async () => {
      old.resolve(response({ ...table, period: { ...table.period, date_from: "2000-01-01", clamped: true } }));
      vi.advanceTimersByTime(300);
    });
    expect(result.current.filters).toMatchObject({ offset: 25, dateFrom: "2026-10-20" });
    expect(result.current.sort).toEqual(["-created_at"]);
    expect(result.current.searchDraft).toBe(" draft ");
    const count = queries.mock.calls.length;
    await act(async () => rerender({ active: true }));
    expect(queries).toHaveBeenCalledTimes(count + 1);
    await act(async () => vi.advanceTimersByTime(300));
    expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ search: "draft", offset: 0, ordering: "-created_at" }));
    expect(message.warning).not.toHaveBeenCalled();
  });
  it("FT-QM-09 refuses missing metrics_table instead of false empty success", async () => {
    queries.mockResolvedValueOnce(apiSuccess({ items: [], total: 0 } as unknown as SeoSearchQueriesOutDto));
    const { result } = await ready();
    expect(result.current.error).toBe("Не удалось загрузить метрики запросов");
  });
});
