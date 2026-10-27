import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiError, apiSuccess } from "@/lib/apiStatus";
import type { ApiResult } from "@/types/api/api";
import type { MetricsTableOutDto } from "@/types/api/metricsTable";
import type { SeoDataResource, SeoPagesOutDto } from "@/types/api/seo";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { fetchSeoPages, fetchSeoSearchQueries } from "../services/seoDataService";
import { useSeoDataTable } from "./useSeoDataTable";

const context = vi.hoisted(() => ({ scopes: ["ADMIN"] as string[] }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));
vi.mock("../services/seoDataService", async importOriginal => ({
  ...await importOriginal<typeof import("../services/seoDataService")>(),
  fetchSeoPages: vi.fn(), fetchSeoSearchQueries: vi.fn(),
}));
const pages = vi.mocked(fetchSeoPages);
const queries = vi.mocked(fetchSeoSearchQueries);
const row = { id: "page-id", page: "/catalog", created_at: "2026-01-02T03:04:00Z" };
const metricsTable: MetricsTableOutDto = {
  version: 1, row_key: "id", ordering: null, columns: [],
  period: { mode: "day", date_from: "2026-10-20", date_to: "2026-10-26", today: "2026-10-26",
    requested_date_from: null, requested_date_to: null, defaulted: true, adjusted: false, clamped: false },
  metric: { key: "visits", title: "Визиты", value_type: "integer" },
};
const deferred = () => {
  let resolve!: (value: ApiResult<SeoPagesOutDto>) => void;
  const promise = new Promise<ApiResult<SeoPagesOutDto>>(done => { resolve = done; });
  return { promise, resolve };
};

beforeEach(() => {
  context.scopes = [KNOWN_USER_SCOPES.ADMIN];
  pages.mockReset().mockResolvedValue(apiSuccess({ items: [row], total: 101, metrics_table: metricsTable }));
  queries.mockReset().mockResolvedValue(apiSuccess({ items: [{ id: "query-id", query: "horse", created_at: row.created_at }], total: 77 }));
});
afterEach(() => vi.useRealTimers());

describe.each<SeoDataResource>(["pages", "queries"])("UT-SEO-07..10 %s", resource => {
  const request = () => resource === "pages" ? pages : queries;
  const field = resource === "pages" ? "page" : "query";
  it("loads 25/0 and exposes total/data, then maps page and size resets", async () => {
    const { result } = renderHook(() => useSeoDataTable(resource, true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(request()).toHaveBeenLastCalledWith({ limit: 25, offset: 0, search: undefined, ordering: undefined });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.total).toBe(resource === "pages" ? 101 : 77);
    act(() => result.current.setFilters(previous => ({ ...previous, offset: 25 })));
    await waitFor(() => expect(request()).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 25, offset: 25 })));
    act(() => result.current.setFilters(previous => ({ ...previous, limit: 50, offset: 50 })));
    await waitFor(() => expect(request()).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 50, offset: 0 })));
  });

  it("debounces exactly 300ms, preserves draft spaces, trims literal multiword search and resets offset", async () => {
    const { result } = renderHook(() => useSeoDataTable(resource, true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setFilters(previous => ({ ...previous, offset: 25 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.useFakeTimers();
    const calls = request().mock.calls.length;
    act(() => result.current.changeSearch("  two words %_\\  "));
    expect(result.current.searchDraft).toBe("  two words %_\\  ");
    act(() => vi.advanceTimersByTime(299));
    expect(request()).toHaveBeenCalledTimes(calls);
    await act(async () => vi.advanceTimersByTime(1));
    expect(request()).toHaveBeenLastCalledWith(expect.objectContaining({ search: "two words %_\\", offset: 0 }));
  });

  it("clear is immediate and cancels queued search; whitespace becomes undefined", async () => {
    const { result } = renderHook(() => useSeoDataTable(resource, true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.useFakeTimers();
    act(() => result.current.changeSearch("queued"));
    await act(async () => result.current.changeSearch(""));
    await act(async () => vi.advanceTimersByTime(300));
    expect(request()).not.toHaveBeenCalledWith(expect.objectContaining({ search: "queued" }));
    act(() => result.current.changeSearch("   "));
    await act(async () => vi.advanceTimersByTime(300));
    expect(result.current.filters.search).toBeUndefined();
    expect(result.current.searchDraft).toBe("   ");
  });

  it("SF-04 immediate clear cancels pending draft while retaining ordering and limit", async () => {
    const { result } = renderHook(() => useSeoDataTable(resource, true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.changeSort([`-${field}`]));
    act(() => result.current.setFilters(previous => ({ ...previous, limit: 50, offset: 0 })));
    act(() => result.current.setFilters(previous => ({ ...previous, offset: 50 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.useFakeTimers();
    act(() => result.current.changeSearch(" applied "));
    await act(async () => vi.advanceTimersByTime(300));
    act(() => result.current.changeSearch(" queued "));
    await act(async () => result.current.changeSearch(""));
    expect(result.current.searchDraft).toBe("");
    expect(request()).toHaveBeenLastCalledWith({ limit: 50, offset: 0, search: undefined, ordering: `-${field}` });
    const calls = request().mock.calls.length;
    await act(async () => vi.advanceTimersByTime(300));
    expect(request()).toHaveBeenCalledTimes(calls);
    expect(result.current.sort).toEqual([`-${field}`]);
  });

  it("maps asc/desc/clear only for the allowed value field and controls the indicator", async () => {
    const { result } = renderHook(() => useSeoDataTable(resource, true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    for (const ordering of [field, `-${field}`, undefined, "created_at"]) {
      act(() => result.current.setFilters(previous => ({ ...previous, offset: 25 })));
      act(() => result.current.changeSort(ordering ? [ordering] : []));
      await waitFor(() => expect(result.current.loading).toBe(false));
      const expected = ordering === "created_at" ? undefined : ordering;
      expect(request()).toHaveBeenLastCalledWith(expect.objectContaining({ ordering: expected, offset: 0 }));
      expect(result.current.sort).toEqual(expected ? [expected] : []);
    }
  });

  it("does not read inactive or forbidden tables, activation loads, revoke clears and stops retries", async () => {
    context.scopes = [KNOWN_USER_SCOPES.SUPERUSER];
    const { result, rerender } = renderHook(({ active }) => useSeoDataTable(resource, active), { initialProps: { active: false } });
    rerender({ active: true });
    expect(request()).not.toHaveBeenCalled();
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    rerender({ active: false });
    expect(request()).not.toHaveBeenCalled();
    rerender({ active: true });
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    context.scopes = [];
    rerender({ active: true });
    const calls = request().mock.calls.length;
    act(() => { result.current.retry(); result.current.changeSearch("blocked"); result.current.changeSort([field]); });
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(request()).toHaveBeenCalledTimes(calls);
  });

  it("exposes backend denial as error, retry recovers, empty success is separate", async () => {
    request().mockResolvedValueOnce(apiError("Доступ запрещён"));
    const { result } = renderHook(() => useSeoDataTable(resource, true));
    await waitFor(() => expect(result.current.error).toBe("Доступ запрещён"));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.error).toBeNull();
    if (resource === "pages") pages.mockResolvedValueOnce(apiSuccess({ items: [], total: 0, metrics_table: metricsTable }));
    else queries.mockResolvedValueOnce(apiSuccess({ items: [], total: 0 }));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.items).toEqual([]));
    expect(result.current.error).toBeNull();
  });
});

describe("UT-SEO-10 generations and independent state", () => {
  it.each([false, true])("ignores stale response (error=%s) after newer filter request", async error => {
    const old = deferred();
    pages.mockReturnValueOnce(old.promise);
    const { result } = renderHook(() => useSeoDataTable("pages", true));
    expect(result.current.loading).toBe(true);
    act(() => result.current.changeSort(["page"]));
    await waitFor(() => expect(result.current.items).toEqual([row]));
    await act(async () => old.resolve(error ? apiError("stale error") : apiSuccess({ items: [], total: 0, metrics_table: metricsTable })));
    expect(result.current.items).toEqual([row]);
    expect(result.current.error).toBeNull();
  });
  it.each([
    ["revoke", false], ["revoke", true], ["deactivate", false],
    ["deactivate", true], ["unmount", false], ["unmount", true],
  ] as const)("ignores pending response after %s (error=%s)", async (action, error) => {
    const old = deferred();
    pages.mockReturnValueOnce(old.promise);
    const { result, rerender, unmount } = renderHook(({ active }) => useSeoDataTable("pages", active), { initialProps: { active: true } });
    if (action === "unmount") unmount();
    else {
      if (action === "revoke") context.scopes = [];
      rerender({ active: action !== "deactivate" });
    }
    await act(async () => old.resolve(error ? apiError("late error") : apiSuccess({ items: [row], total: 1, metrics_table: metricsTable })));
    expect(result.current.error).toBeNull();
    expect(result.current.items).toEqual([]);
  });
  it("corrects a now-empty last page once and refetches the last valid offset", async () => {
    const { result } = renderHook(() => useSeoDataTable("pages", true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    pages.mockResolvedValueOnce(apiSuccess({ items: [], total: 26, metrics_table: metricsTable }));
    act(() => result.current.setFilters(previous => ({ ...previous, offset: 100 })));
    await waitFor(() => expect(pages).toHaveBeenLastCalledWith(expect.objectContaining({ offset: 25 })));
    await waitFor(() => expect(result.current.items).toEqual([row]));
    expect(pages).toHaveBeenCalledTimes(3);
  });
  it("retains separate filters/order/offset when switching visited tables", async () => {
    const { result, rerender } = renderHook(({ active }) => ({
      pages: useSeoDataTable("pages", active === "pages"),
      queries: useSeoDataTable("queries", active === "queries"),
    }), { initialProps: { active: "pages" } });
    act(() => result.current.pages.changeSort(["-page"]));
    act(() => result.current.pages.setFilters(previous => ({ ...previous, offset: 25 })));
    rerender({ active: "queries" });
    act(() => result.current.queries.changeSort(["query"]));
    await waitFor(() => expect(result.current.queries.loading).toBe(false));
    expect(result.current.queries.filters.offset).toBe(0);
    rerender({ active: "pages" });
    await waitFor(() => expect(result.current.pages.loading).toBe(false));
    expect(result.current.pages.filters.offset).toBe(25);
    expect(result.current.pages.sort).toEqual(["-page"]);
    expect(result.current.queries.sort).toEqual(["query"]);
  });
  it("keeps searches independent and cancels inactive timers until reactivation", async () => {
    const { result, rerender } = renderHook(({ active }) => ({
      pages: useSeoDataTable("pages", active === "pages"),
      queries: useSeoDataTable("queries", active === "queries"),
    }), { initialProps: { active: "pages" } });
    await waitFor(() => expect(result.current.pages.loading).toBe(false));
    vi.useFakeTimers();
    act(() => result.current.pages.changeSearch(" page draft "));
    await act(async () => rerender({ active: "queries" }));
    act(() => result.current.queries.changeSearch(" query draft "));
    await act(async () => vi.advanceTimersByTime(300));
    expect(pages).toHaveBeenCalledTimes(1);
    expect(queries).toHaveBeenLastCalledWith(expect.objectContaining({ search: "query draft" }));
    await act(async () => rerender({ active: "pages" }));
    await act(async () => vi.advanceTimersByTime(300));
    expect(pages).toHaveBeenLastCalledWith(expect.objectContaining({ search: "page draft" }));
    expect(result.current.queries.filters.search).toBe("query draft");
    expect(result.current.pages.searchDraft).toBe(" page draft ");
  });

  it("cancels debounce on unmount and handles thrown network failures", async () => {
    pages.mockRejectedValueOnce(new Error("network"));
    const { result, unmount } = renderHook(() => useSeoDataTable("pages", true));
    await waitFor(() => expect(result.current.error).toMatch(/Не удалось/));
    vi.useFakeTimers();
    act(() => result.current.changeSearch("queued"));
    unmount();
    await act(async () => vi.advanceTimersByTime(300));
    expect(pages).toHaveBeenCalledTimes(1);
  });
});
