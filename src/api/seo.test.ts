import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { apiSuccess, isApiError } from "@/lib/apiStatus";
import * as seo from "./seo";
import { SEO_PARSE_PROVIDER } from "@/types/api/seo";

const base = "http://127.0.0.1/api";
const root = "/seo/page-normalization";
const hashPath = `${root}/blacklisted-hashes`;
const paramPath = `${root}/blacklisted-query-params`;
const id = "94b07543-7561-4c38-9ac6-6ed01d953518";
const item = { id, value: "Top", created_at: "2026-10-24T10:00:00Z" };
const page = { id, page: "/catalog", created_at: item.created_at };
const queryItem = { id, query: "конь", created_at: item.created_at };
const search = "%_\\ !?&=#";
const operations = [
  { name: "pages", method: "get", path: "/seo/pages", run: () => seo.getSeoPages({ limit: 25, offset: 50, search, ordering: "-page" }), response: { items: [page], total: 51 }, status: 200, errors: [400] },
  { name: "queries", method: "get", path: "/seo/search-queries", run: () => seo.getSeoSearchQueries({ limit: 25, offset: 50, search, ordering: "query" }), response: { items: [queryItem], total: 51 }, status: 200, errors: [400] },
  { name: "hash list", method: "get", path: hashPath, run: seo.getSeoBlacklistedHashes, response: { items: [item], total: 1 }, status: 200, errors: [] },
  { name: "params list", method: "get", path: paramPath, run: seo.getSeoBlacklistedQueryParams, response: { items: [item], total: 1 }, status: 200, errors: [] },
  { name: "hash create", method: "post", path: hashPath, run: () => seo.createSeoBlacklistedHash({ value: "Top", ...{ tenant: "ignored" } }), response: item, status: 201, errors: [400, 409] },
  { name: "params create", method: "post", path: paramPath, run: () => seo.createSeoBlacklistedQueryParam({ value: "Top", ...{ tenant: "ignored" } }), response: item, status: 201, errors: [400, 409] },
  { name: "hash delete", method: "delete", path: `${hashPath}/${id}`, run: () => seo.deleteSeoBlacklistedHash(id), response: null, status: 204, errors: [400, 404] },
  { name: "params delete", method: "delete", path: `${paramPath}/${id}`, run: () => seo.deleteSeoBlacklistedQueryParam(id), response: null, status: 204, errors: [400, 404] },
] as const;

function successResponse(status: number, body: (typeof operations)[number]["response"]) {
  return status === 204 ? new HttpResponse(null, { status }) : HttpResponse.json(body, { status });
}

describe.each(operations)("UT-SEO-01..04 $name", (operation) => {
  it("authenticated ADMIN: exact request and canonical result", async () => {
    const handled = vi.fn();
    server.use(http[operation.method](`${base}${operation.path}`, async ({ request }) => {
      handled();
      expect(request.credentials).toBe("include");
      expect(request.headers.has("X-Equestrian-Id")).toBe(false);
      const url = new URL(request.url);
      const dataList = operation.path === "/seo/pages" || operation.path === "/seo/search-queries";
      expect([...url.searchParams.keys()].sort()).toEqual(dataList ? ["limit", "offset", "ordering", "search"] : []);
      if (dataList) {
        expect(url.searchParams.get("search")).toBe(search);
        expect(url.searchParams.get("limit")).toBe("25");
        expect(url.searchParams.get("offset")).toBe("50");
        expect(url.searchParams.get("ordering")).toBe(operation.name === "pages" ? "-page" : "query");
      }
      if (operation.method === "post") expect(await request.json()).toEqual({ value: "Top" });
      else expect(await request.text()).toBe("");
      return successResponse(operation.status, operation.response);
    }));
    expect(await operation.run()).toEqual(apiSuccess(operation.response));
    expect(handled).toHaveBeenCalledOnce();
  });

  it("expired session: shared refresh succeeds and retries exactly once", async () => {
    let calls = 0;
    const refresh = vi.fn(() => new HttpResponse(null, { status: 204 }));
    const bodies: string[] = [];
    server.use(
      http.post(`${base}/auth/refresh`, refresh),
      http[operation.method](`${base}${operation.path}`, async ({ request }) => {
        bodies.push(await request.text());
        calls += 1;
        return calls === 1 ? HttpResponse.json({ detail: "Expired" }, { status: 401 })
          : successResponse(operation.status, operation.response);
      }),
    );
    expect(await operation.run()).toEqual(apiSuccess(operation.response));
    expect(calls).toBe(2);
    expect(bodies[0]).toBe(bodies[1]);
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("anonymous: refresh denied, no retry and no false success", async () => {
    const denied = vi.fn(() => HttpResponse.json({ detail: "No session" }, { status: 401 }));
    const refresh = vi.fn(() => HttpResponse.json({ detail: "No session" }, { status: 401 }));
    server.use(http[operation.method](`${base}${operation.path}`, denied), http.post(`${base}/auth/refresh`, refresh));
    expect(isApiError<unknown>(await operation.run())).toBe(true);
    expect(denied).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledOnce();
  });

  it.each([403, 502, ...operation.errors])("HTTP %s remains error without refresh", async (status) => {
    const refresh = vi.fn(() => new HttpResponse(null, { status: 204 }));
    server.use(http.post(`${base}/auth/refresh`, refresh),
      http[operation.method](`${base}${operation.path}`, () => HttpResponse.json({ detail: "Denied" }, { status })));
    const result = await operation.run();
    expect(isApiError<unknown>(result)).toBe(true);
    expect(result.data).toEqual({ detail: "Denied" });
    expect(refresh).not.toHaveBeenCalled();
  });

  it("refresh retry denial remains error without another refresh", async () => {
    const denied = vi.fn(() => HttpResponse.json({ detail: "Still unauthorized" }, { status: 401 }));
    const refresh = vi.fn(() => new HttpResponse(null, { status: 204 }));
    server.use(http[operation.method](`${base}${operation.path}`, denied), http.post(`${base}/auth/refresh`, refresh));
    expect(isApiError<unknown>(await operation.run())).toBe(true);
    expect(denied).toHaveBeenCalledTimes(2);
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("detail-array is an error, not a thrown exception or success", async () => {
    server.use(http[operation.method](`${base}${operation.path}`, () =>
      HttpResponse.json({ detail: [{ loc: ["body", "value"], msg: "Invalid value" }] }, { status: 502 })));
    // The service sanitizes non-string detail; the shared client is unchanged.
    expect(isApiError<unknown>(await operation.run())).toBe(true);
  });

  it("network failure remains error", async () => {
    server.use(http[operation.method](`${base}${operation.path}`, () => HttpResponse.error()));
    expect(isApiError<unknown>(await operation.run())).toBe(true);
  });
});

describe("UT-SEO-01,03,04 edge contracts", () => {
  it.each([
    ["/seo/pages", seo.getSeoPages], ["/seo/search-queries", seo.getSeoSearchQueries],
    [hashPath, seo.getSeoBlacklistedHashes], [paramPath, seo.getSeoBlacklistedQueryParams],
  ] as const)("empty list and no optional query: %s", async (path, run) => {
    server.use(http.get(`${base}${path}`, ({ request }) => {
      expect(new URL(request.url).search).toBe("");
      return HttpResponse.json({ items: [], total: 0 });
    }));
    expect(await run()).toEqual(apiSuccess({ items: [], total: 0 }));
  });

  it.each([
    [hashPath, seo.deleteSeoBlacklistedHash], [paramPath, seo.deleteSeoBlacklistedQueryParam],
  ] as const)("encodes ID and surfaces foreign/missing 404: %s", async (path, run) => {
    const foreignId = "foreign/id?#";
    const called = vi.fn();
    server.use(http.delete(`${base}${path}/*`, ({ request }) => {
      called(request.url, request.headers.has("X-Equestrian-Id"));
      return HttpResponse.json({ detail: "Not found" }, { status: 404 });
    }));
    expect(isApiError<unknown>(await run(foreignId))).toBe(true);
    expect(called).toHaveBeenCalledExactlyOnceWith(`${base}${path}/${encodeURIComponent(foreignId)}`, false);
    // Known UUID owned by another tenant has the same 404 contract.
    expect(isApiError<unknown>(await run(id))).toBe(true);
    expect(called).toHaveBeenLastCalledWith(`${base}${path}/${id}`, false);
  });
});

describe("FT-PM-01..03 pages metrics boundary", () => {
  const table = { version: 1, row_key: "id", columns: [], ordering: null,
    period: { mode: "week", date_from: "2026-10-05", date_to: "2026-10-28", today: "2026-10-28", adjusted: true, clamped: false, defaulted: false, requested_date_from: "2026-10-05", requested_date_to: "2026-10-28" },
    metric: { key: "bounce_rate", title: "Доля отказов", value_type: "percent" } };
  it.each([{ rows: [page] }, { rows: [] }])("preserves metrics_table for success/empty: $rows", async ({ rows }) => {
    const body = { items: rows, total: rows.length, metrics_table: table };
    server.use(http.get(`${base}/seo/pages`, ({ request }) => {
      expect(request.credentials).toBe("include");
      expect(Object.fromEntries(new URL(request.url).searchParams)).toEqual({ mode: "week", metric: "bounce_rate", date_from: "2026-10-05", date_to: "2026-10-28", ordering: "-metric:2026-10-19" });
      return HttpResponse.json(body);
    }));
    expect(await seo.getSeoPages({ mode: "week", metric: "bounce_rate", date_from: "2026-10-05", date_to: "2026-10-28", ordering: "-metric:2026-10-19", search: undefined })).toEqual(apiSuccess(body));
  });
});


describe("FT-QM-01 queries metrics boundary", () => {
  const table = { version: 1, row_key: "id", columns: [], ordering: "-metric:2026-10-19",
    period: { mode: "week", date_from: "2026-10-05", date_to: "2026-10-28", today: "2026-10-28", adjusted: true, clamped: false, defaulted: false, requested_date_from: "2026-10-05", requested_date_to: "2026-10-28" },
    metric: { key: "bounce_rate", title: "Доля отказов", value_type: "percent" }, future_v1_field: { raw: "retained" } };
  const params = { limit: 50, offset: 100, mode: "week", metric: "bounce_rate", date_from: "2026-10-05", date_to: "2026-10-28", ordering: "-metric:2026-10-19", search } as const;
  it.each([{ rows: [queryItem] }, { rows: [] }])("forwards exact metrics query and preserves DTO for $rows", async ({ rows }) => {
    const body = { items: rows, total: rows.length, metrics_table: table, future_response_field: true };
    server.use(http.get(`${base}/seo/search-queries`, ({ request }) => {
      expect(request.credentials).toBe("include");
      expect(request.headers.has("X-Equestrian-Id")).toBe(false);
      expect(request.headers.has("Authorization")).toBe(false);
      expect(Object.fromEntries(new URL(request.url).searchParams)).toEqual({ ...params, limit: "50", offset: "100" });
      return HttpResponse.json(body);
    }));
    expect(await seo.getSeoSearchQueries({ ...params, ...{ tenant: "ignored", selector: "ignored", page: 3, pageSize: 50 } })).toEqual(apiSuccess(body));
  });
  it.each([400, 502, 401, 403])("metrics HTTP %s stays error, 401 uses shared auth refresh", async status => {
    const refresh = vi.fn(() => HttpResponse.json({ detail: "No session" }, { status: 401 }));
    server.use(http.post(`${base}/auth/refresh`, refresh),
      http.get(`${base}/seo/search-queries`, () => HttpResponse.json({ detail: "Denied" }, { status })));
    expect(isApiError(await seo.getSeoSearchQueries(params))).toBe(true);
    expect(refresh).toHaveBeenCalledTimes(status === 401 ? 1 : 0);
  });
});

// FT-PR-01: same shared auth contract as the existing SEO API operations.
describe("FT-PR-01 parse-job boundary", () => {
  const path = `${base}/seo/parse-jobs`;
  const response = { job_id: id, provider: SEO_PARSE_PROVIDER, status: "accepted" };
  const run = () => seo.postSeoParseJob({ provider: SEO_PARSE_PROVIDER, ...{ tenant: "ignored" } });

  it("ADMIN: sends only provider to backend with session credentials", async () => {
    const called = vi.fn();
    server.use(http.post(path, async ({ request }) => {
      called();
      expect(request.credentials).toBe("include");
      expect(request.headers.has("X-Equestrian-Id")).toBe(false);
      expect(request.headers.get("Content-Type")).toBe("application/json");
      expect(await request.json()).toEqual({ provider: SEO_PARSE_PROVIDER });
      return HttpResponse.json(response, { status: 202 });
    }));
    expect(await run()).toEqual(apiSuccess(response));
    expect(called).toHaveBeenCalledOnce();
  });

  it.each([400, 403, 502, 503])("HTTP %s is not success and is not retried", async status => {
    const called = vi.fn(() => HttpResponse.json({ detail: "Denied" }, { status }));
    server.use(http.post(path, called));
    expect(isApiError(await run())).toBe(true);
    expect(called).toHaveBeenCalledOnce();
  });

  it("network failure is not success", async () => {
    server.use(http.post(path, () => HttpResponse.error()));
    expect(isApiError(await run())).toBe(true);
  });

  it.each([true, false])("401 uses shared refresh; refresh success=%s", async succeeds => {
    let calls = 0;
    const refresh = vi.fn(() => new HttpResponse(null, { status: succeeds ? 204 : 401 }));
    server.use(http.post(`${base}/auth/refresh`, refresh), http.post(path, () => {
      calls += 1;
      return calls === 1 ? HttpResponse.json({ detail: "Expired" }, { status: 401 })
        : HttpResponse.json(response, { status: 202 });
    }));
    const result = await run();
    expect(isApiError(result)).toBe(!succeeds);
    expect(calls).toBe(succeeds ? 2 : 1);
    expect(refresh).toHaveBeenCalledOnce();
  });
});
