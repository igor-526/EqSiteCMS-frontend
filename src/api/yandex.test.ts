import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { apiSuccess, isApiError } from "@/lib/apiStatus";
import * as yandex from "./yandex";

const base = "http://127.0.0.1/api";
const account = { id: "account", yandex_id: "123", yandex_login: "fixture", display_name: "Fixture", email: null, yandex_phone: null };
const binding = { yandex_account_id: account.id, counter_id: "123" };
const connection = { id: "connection", counter_id: "123", yandex_account: account };
const code = { code: "mock-only", state: "mock-state" };
const operations = [
  { method: "get", path: "/auth/link", run: yandex.getYandexAuthLink, body: null, response: { auth_link: "https://example.invalid/oauth" } },
  { method: "post", path: "/auth/code", run: () => yandex.exchangeYandexAuthCode({ ...code, ...{ tenant: "ignored" } }), body: code, response: account },
  { method: "get", path: "/accounts", run: yandex.getYandexAccounts, body: null, response: { items: [], total: 0 } },
  { method: "delete", path: "/accounts/account", run: () => yandex.deleteYandexAccount(account.id), body: null, response: null },
  { method: "get", path: "/metrica/counters", run: () => yandex.getYandexMetricaCounters({ account_id: account.id }), body: null, response: { items: [], total: 0 } },
  { method: "get", path: "/metrica/connection", run: yandex.getYandexMetricaConnection, body: null, response: { counter: null } },
  { method: "post", path: "/metrica/connection", run: () => yandex.setYandexMetricaConnection({ ...binding, ...{ tenant: "ignored" } }), body: binding, response: connection },
  { method: "delete", path: "/metrica/connection", run: yandex.deleteYandexMetricaConnection, body: null, response: null },
] as const;

describe.each(operations)("FE-A06 backend Yandex $method $path", operation => {
  const url = `${base}/yandex${operation.path}`;
  it("SEO session: exact backend request, no tenant selector, canonical success/empty", async () => {
    const handler = vi.fn(async ({ request }: { request: Request }) => {
      expect(request.credentials).toBe("include");
      expect(request.headers.has("X-Equestrian-Id")).toBe(false);
      expect(Object.fromEntries(new URL(request.url).searchParams)).toEqual(operation.path === "/metrica/counters" ? { account_id: account.id } : {});
      if (operation.body) expect(await request.json()).toEqual(operation.body);
      else expect(await request.text()).toBe("");
      return operation.method === "delete" ? new HttpResponse(null, { status: 204 }) : HttpResponse.json(operation.response);
    });
    server.use(http[operation.method](url, handler));
    expect(await operation.run()).toEqual(apiSuccess(operation.response));
    expect(handler).toHaveBeenCalledOnce();
  });
  it.each([400, 403, 502, 503])("HTTP %s never becomes success or an automatic retry", async status => {
    const handler = vi.fn(() => HttpResponse.json({ detail: "Denied" }, { status }));
    server.use(http[operation.method](url, handler));
    expect(isApiError<unknown>(await operation.run())).toBe(true);
    expect(handler).toHaveBeenCalledOnce();
  });
  it("401 uses shared auth flow; denied refresh never retries operation", async () => {
    const handler = vi.fn(() => new HttpResponse(null, { status: 401 }));
    const refresh = vi.fn(() => new HttpResponse(null, { status: 401 }));
    server.use(http[operation.method](url, handler), http.post(`${base}/auth/refresh`, refresh));
    expect(isApiError<unknown>(await operation.run())).toBe(true);
    expect(handler).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledOnce();
  });
  it("network failure remains an error", async () => {
    server.use(http[operation.method](url, () => HttpResponse.error()));
    expect(isApiError<unknown>(await operation.run())).toBe(true);
  });
});
