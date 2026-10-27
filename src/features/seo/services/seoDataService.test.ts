import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/api/seo";
import { apiError, apiSuccess, isApiError } from "@/lib/apiStatus";
import type { ApiResult } from "@/types/api/api";
import type { SeoPagesQueryInDto, SeoSearchQueriesQueryInDto } from "@/types/api/seo";
import * as service from "./seoDataService";
import type { MetricsTableOutDto } from "@/types/api/metricsTable";

vi.mock("@/api/seo", () => ({
  getSeoPages: vi.fn(), getSeoSearchQueries: vi.fn(),
  getSeoBlacklistedHashes: vi.fn(), getSeoBlacklistedQueryParams: vi.fn(),
  createSeoBlacklistedHash: vi.fn(), createSeoBlacklistedQueryParam: vi.fn(),
  deleteSeoBlacklistedHash: vi.fn(), deleteSeoBlacklistedQueryParam: vi.fn(),
}));
beforeEach(() => vi.resetAllMocks());
const item = { id: "id", value: "Top", created_at: "2026-10-24T10:00:00Z" };

describe("UT-SEO-01,03 data service", () => {
  it("preserves success, empty and error ApiResult", async () => {
    const success = apiSuccess({ items: [{ id: "id", page: "/", created_at: item.created_at }], total: 1, metrics_table: metricsTableFixture });
    const empty = apiSuccess({ items: [], total: 0, metrics_table: metricsTableFixture });
    const error = apiError("Недостаточно прав");
    for (const result of [success, empty, error]) {
      vi.mocked(api.getSeoPages).mockResolvedValueOnce(result);
      expect(await service.fetchSeoPages()).toBe(result);
    }
  });
  it("normalizes search only by trim and whitelists ordering for both resources", async () => {
    vi.mocked(api.getSeoPages).mockResolvedValue(apiSuccess({ items: [], total: 0, metrics_table: metricsTableFixture }));
    vi.mocked(api.getSeoSearchQueries).mockResolvedValue(apiSuccess({ items: [], total: 0 }));
    const search = "%_\\ !?&=#";
    await service.fetchSeoPages({ search: `  ${search}  `, ordering: "-page", limit: 25, offset: 50 });
    expect(api.getSeoPages).toHaveBeenLastCalledWith({ search, ordering: "-page", limit: 25, offset: 50 });
    await service.fetchSeoSearchQueries({ search: ` ${search} `, ordering: "query", limit: 10, offset: 20 });
    expect(api.getSeoSearchQueries).toHaveBeenLastCalledWith({ search, ordering: "query", limit: 10, offset: 20 });
    await service.fetchSeoPages({ search: "   ", ordering: "id" } as unknown as SeoPagesQueryInDto);
    expect(api.getSeoPages).toHaveBeenLastCalledWith({ search: undefined, ordering: undefined, limit: undefined, offset: undefined });
    await service.fetchSeoSearchQueries({ search: "", ordering: "page" } as unknown as SeoSearchQueriesQueryInDto);
    expect(api.getSeoSearchQueries).toHaveBeenLastCalledWith({ search: undefined, ordering: undefined, limit: undefined, offset: undefined });
  });
  it.each([
    ["ascend", "page", "query"], ["descend", "-page", "-query"], [null, undefined, undefined],
  ] as const)("maps value sorter %s and rejects other fields", (order, pages, queries) => {
    expect(service.mapSeoPageOrdering("page", order)).toBe(pages);
    expect(service.mapSeoQueryOrdering("query", order)).toBe(queries);
    expect(service.mapSeoPageOrdering("id", order)).toBeUndefined();
    expect(service.mapSeoQueryOrdering("id", order)).toBeUndefined();
    expect(service.mapSeoPageOrdering(undefined, order)).toBeUndefined();
  });
  it("sanitizes detail-array/object/null without interpreting status or HTML", () => {
    for (const detail of [[{ msg: "Bad body" }], { error: "Bad" }, null]) {
      const result = service.safeSeoResult({ ...apiError(""), data: { detail } } as unknown as ApiResult<null>);
      expect(isApiError(result)).toBe(true);
      expect(result.data).toEqual({ detail: "Не удалось выполнить операцию SEO" });
    }
    const text = apiError("<b>literal error text</b>");
    expect(service.safeSeoResult(text)).toBe(text);
  });
});

describe.each(["hashes", "params"] as const)("UT-SEO-01,06 %s service", (kind) => {
  const list = kind === "hashes" ? api.getSeoBlacklistedHashes : api.getSeoBlacklistedQueryParams;
  const create = kind === "hashes" ? api.createSeoBlacklistedHash : api.createSeoBlacklistedQueryParam;
  const remove = kind === "hashes" ? api.deleteSeoBlacklistedHash : api.deleteSeoBlacklistedQueryParam;
  it("list_all preserves success, empty and error, with no query", async () => {
    for (const result of [apiSuccess({ items: [item], total: 1 }), apiSuccess({ items: [], total: 0 }), apiError("Unavailable")]) {
      vi.mocked(list).mockResolvedValueOnce(result);
      expect(await service.fetchSeoNormalization(kind)).toBe(result);
      expect(list).toHaveBeenLastCalledWith();
    }
  });
  it("validates create and preserves canonical success or backend error", async () => {
    const canonical = apiSuccess(item);
    vi.mocked(create).mockResolvedValueOnce(canonical);
    expect(await service.submitSeoNormalization(kind, { value: kind === "hashes" ? " #Top " : " Top " })).toBe(canonical);
    expect(create).toHaveBeenCalledExactlyOnceWith({ value: "Top" });
    const error = apiError("Conflict");
    vi.mocked(create).mockResolvedValueOnce(error);
    expect(await service.submitSeoNormalization(kind, { value: "Top" })).toBe(error);
  });
  it.each(["", "#", "##", "bad value", "😀".repeat(256)])("blocks invalid create before API: %s", async (value) => {
    expect(isApiError(await service.submitSeoNormalization(kind, { value }))).toBe(true);
    expect(create).not.toHaveBeenCalled();
  });
  it("delete preserves 204=null or error without retry", async () => {
    for (const result of [apiSuccess(null), apiError("Not found")]) {
      vi.mocked(remove).mockResolvedValueOnce(result);
      expect(await service.removeSeoNormalization(kind, "foreign-id")).toBe(result);
      expect(remove).toHaveBeenLastCalledWith("foreign-id");
    }
    expect(remove).toHaveBeenCalledTimes(2);
  });
});

describe("FT-PM-02 pages ordering and query", () => {
  it.each(["page", "created_at", "metric:2026-10-20"])("maps %s both ways and clears", field => {
    expect(service.mapSeoPageOrdering(field, "ascend")).toBe(field);
    expect(service.mapSeoPageOrdering(field, "descend")).toBe(`-${field}`);
    expect(service.mapSeoPageOrdering(field, null)).toBeUndefined();
  });
  it.each(["id", "metric:tomorrow", "metric:2026-1-1", "page,-created_at", "-page"])("rejects %s", field => {
    expect(service.mapSeoPageOrdering(field, "ascend")).toBeUndefined();
  });
  it("passes metrics filters unchanged", async () => {
    vi.mocked(api.getSeoPages).mockResolvedValue(apiSuccess({ items: [], total: 0, metrics_table: metricsTableFixture }));
    const filters = { mode: "week", metric: "bounce_rate", date_from: "2026-10-05", date_to: "2026-10-28", ordering: "-metric:2026-10-19" } as const;
    await service.fetchSeoPages(filters);
    expect(api.getSeoPages).toHaveBeenCalledWith(expect.objectContaining(filters));
  });
});

const metricsTableFixture: MetricsTableOutDto = {
  version: 1, row_key: "id", ordering: null,
  period: { mode: "day", date_from: "2026-10-20", date_to: "2026-10-26", today: "2026-10-26",
    requested_date_from: null, requested_date_to: null, defaulted: true, adjusted: false, clamped: false },
  metric: { key: "visits", title: "Визиты", value_type: "integer" }, columns: [],
};
