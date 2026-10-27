import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { API_STATUS, apiError, apiSuccess } from "@/lib/apiStatus";
import apiFetch, { apiFetchFormData } from "./client";

const base = "http://127.0.0.1/api";
const path = "/client-status-test";

describe("FE-1b shared client opt-in HTTP error metadata", () => {
  it.each([400, 403, 502, 503])("HTTP %s keeps legacy shape unless opted in", async status => {
    server.use(http.post(`${base}${path}`, () => HttpResponse.json({ detail: "Original detail" }, { status })));
    expect(await apiFetch(path, { method: "POST" })).toEqual(apiError("Original detail"));
    expect(await apiFetch(path, { method: "POST" }, true)).toEqual({ ...apiError("Original detail"), httpStatus: status });
  });

  it.each([false, true])("401 refresh denied preserves auth flow; metadata=%s", async metadata => {
    const refresh = vi.fn(() => new HttpResponse(null, { status: 401 }));
    const post = vi.fn(() => new HttpResponse(null, { status: 401 }));
    server.use(http.post(`${base}/auth/refresh`, refresh), http.post(`${base}${path}`, post));
    expect(await apiFetch(path, { method: "POST" }, metadata)).toEqual({
      ...apiError("Authentication failed"), ...(metadata && { httpStatus: 401 }),
    });
    expect(refresh).toHaveBeenCalledOnce();
    expect(post).toHaveBeenCalledOnce();
  });

  it.each([401, 403, 502, 503])("uses final retry status %s after successful refresh", async status => {
    let calls = 0;
    const refresh = vi.fn(() => new HttpResponse(null, { status: 204 }));
    server.use(http.post(`${base}/auth/refresh`, refresh), http.post(`${base}${path}`, () => {
      calls += 1;
      return HttpResponse.json({ detail: "Final detail" }, { status: calls === 1 ? 401 : status });
    }));
    expect(await apiFetch(path, { method: "POST" }, true)).toEqual({ ...apiError("Final detail"), httpStatus: status });
    expect(calls).toBe(2);
    expect(refresh).toHaveBeenCalledOnce();
  });

  it.each([false, true])("success and network error shape unchanged; metadata=%s", async metadata => {
    server.use(http.post(`${base}${path}`, () => HttpResponse.json({ value: 1 }, { status: 202 })));
    expect(await apiFetch(path, { method: "POST" }, metadata)).toEqual(apiSuccess({ value: 1 }));
    server.use(http.post(`${base}${path}`, () => new HttpResponse(null, { status: 204 })));
    expect(await apiFetch(path, { method: "POST" }, metadata)).toEqual(apiSuccess(null));
    server.use(http.post(`${base}${path}`, () => HttpResponse.error()));
    expect(await apiFetch(path, { method: "POST" }, metadata)).toEqual(apiError("Network error or invalid JSON"));
  });

  it("keeps FormData legacy errors unchanged", async () => {
    server.use(http.post(`${base}${path}`, () => HttpResponse.json({ detail: "Denied" }, { status: 403 })));
    expect(await apiFetchFormData(path, new FormData())).toEqual(apiError("Denied"));
  });
});


describe.each([false, true])("QGFA-104-01 client detail extraction; auth retry=%s", retry => {
  it.each([null, false, 0, true, 42, [], { debug: "PRIVATE" }, "", " \n\t "])("invalid detail=%j is not serialized for opt-in, legacy stays unchanged", async detail => {
    const body = JSON.stringify({ detail, internal_debug: "PRIVATE" });
    installInvalidDetailResponse(body, retry);
    expect(await apiFetch(path, { method: "POST" }, true)).toEqual({ ...apiError(""), httpStatus: 400 });
    installInvalidDetailResponse(body, retry);
    expect(await apiFetch(path, { method: "POST" })).toEqual({
      status: API_STATUS.ERROR, data: { detail: detail || body },
    });
  });

  it.each(["{bad JSON: PRIVATE", '{"internal_debug":"PRIVATE"}', '"PRIVATE"', "null", '["PRIVATE"]'])("invalid body %s has no raw fallback in opt-in", async body => {
    installInvalidDetailResponse(body, retry);
    expect(await apiFetch(path, { method: "POST" }, true)).toEqual({ ...apiError(""), httpStatus: 400 });
    installInvalidDetailResponse(body, retry);
    expect(await apiFetch(path, { method: "POST" })).toEqual(apiError(body));
  });
});

function installInvalidDetailResponse(body: string, retry: boolean) {
  let calls = 0;
  server.use(http.post(`${base}/auth/refresh`, () => new HttpResponse(null, { status: 204 })),
    http.post(`${base}${path}`, () => {
      calls += 1;
      return retry && calls === 1 ? new HttpResponse(null, { status: 401 })
        : new HttpResponse(body, { status: 400 });
    }));
}
