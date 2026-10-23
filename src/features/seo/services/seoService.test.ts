import { http, HttpResponse } from "msw";
import { describe, expect, expectTypeOf, it } from "vitest";
import { isApiError, isApiSuccess } from "@/lib/apiStatus";
import { server } from "@/test/msw/server";
import type { YandexAccountOutDto } from "@/types/api/yandex";
import * as seo from "./seoService";

const api = (path: string) => `http://127.0.0.1/api/yandex${path}`;
const account: YandexAccountOutDto = {
  id: "account-1", yandex_id: "123", yandex_login: "test",
  display_name: "Тестовый аккаунт", email: null, yandex_phone: null,
};
const connection = { id: "connection-1", counter_id: "123", yandex_account: account };
const code = { code: "test-code", state: "tenant-1" };
const binding = { yandex_account_id: account.id, counter_id: "123" };

const operations = [
  { method: "get", path: "/auth/link", call: () => seo.fetchYandexAuthLink() },
  { method: "post", path: "/auth/code", call: () => seo.submitYandexAuthCode(code) },
  { method: "get", path: "/accounts", call: () => seo.fetchYandexAccounts() },
  { method: "delete", path: "/accounts/account-1", call: () => seo.unlinkYandexAccount(account.id) },
  { method: "get", path: "/metrica/counters", call: () => seo.fetchMetricaCounters({ account_id: account.id }) },
  { method: "get", path: "/metrica/connection", call: () => seo.fetchMetricaConnection() },
  { method: "post", path: "/metrica/connection", call: () => seo.bindMetricaCounter(binding) },
  { method: "delete", path: "/metrica/connection", call: () => seo.unlinkMetricaCounter() },
] as const;

describe("FT-YX-01/02 SEO API boundary and service", () => {
  it("uses all eight methods, paths, request bodies and response DTOs", async () => {
    const calls: string[] = [];
    server.use(
      http.get(api("/auth/link"), () => { calls.push("link"); return HttpResponse.json({ auth_link: "https://oauth.yandex.ru/authorize" }); }),
      http.post(api("/auth/code"), async ({ request }) => { calls.push("code"); expect(await request.json()).toEqual(code); return HttpResponse.json(account); }),
      http.get(api("/accounts"), () => { calls.push("accounts"); return HttpResponse.json({ items: [account], total: 1 }); }),
      http.delete(api("/accounts/account-1"), () => { calls.push("delete account"); return new HttpResponse(null, { status: 204 }); }),
      http.get(api("/metrica/counters"), ({ request }) => { calls.push("counters"); expect(new URL(request.url).searchParams.get("account_id")).toBe(account.id); return HttpResponse.json({ items: [{ counter_id: 123, site: "https://example.invalid" }], total: 1 }); }),
      http.get(api("/metrica/connection"), () => { calls.push("connection"); return HttpResponse.json({ counter: connection }); }),
      http.post(api("/metrica/connection"), async ({ request }) => { calls.push("bind"); expect(await request.json()).toEqual(binding); return HttpResponse.json(connection); }),
      http.delete(api("/metrica/connection"), () => { calls.push("unlink"); return new HttpResponse(null, { status: 204 }); }),
    );
    const expected = [
      { auth_link: "https://oauth.yandex.ru/authorize" }, account, { items: [account], total: 1 }, null,
      { items: [{ counter_id: 123, site: "https://example.invalid" }], total: 1 }, { counter: connection }, connection, null,
    ];
    for (const [index, operation] of operations.entries()) {
      const result = await operation.call();
      expect(isApiSuccess<unknown>(result)).toBe(true);
      expect(result.data).toEqual(expected[index]);
    }
    expect(calls).toEqual(["link", "code", "accounts", "delete account", "counters", "connection", "bind", "unlink"]);
  });

  it("preserves string display_name, including empty string, and nullable contact fields", async () => {
    expectTypeOf<YandexAccountOutDto["display_name"]>().toEqualTypeOf<string>();
    const unnamedAccount: YandexAccountOutDto = { ...account, display_name: "" };
    server.use(http.get(api("/accounts"), () => HttpResponse.json({ items: [unnamedAccount], total: 1 })));
    expect((await seo.fetchYandexAccounts()).data).toEqual({ items: [unnamedAccount], total: 1 });
  });

  it("serializes only whitelisted query parameters, including zero offset and encoded search", async () => {
    const search = "тест & сайт";
    server.use(
      http.get(api("/accounts"), ({ request }) => {
        expect(Object.fromEntries(new URL(request.url).searchParams)).toEqual({ limit: "20", offset: "0", search });
        return HttpResponse.json({ items: [], total: 0 });
      }),
      http.get(api("/metrica/counters"), ({ request }) => {
        expect(Object.fromEntries(new URL(request.url).searchParams)).toEqual({ account_id: account.id, limit: "10", offset: "20", search });
        return HttpResponse.json({ items: [], total: 0 });
      }),
    );
    const query = { limit: 20, offset: 0, search, equestrian_id: "forged", page: 9 };
    expect((await seo.fetchYandexAccounts(query)).data).toEqual({ items: [], total: 0 });
    expect((await seo.fetchMetricaCounters({ ...query, account_id: account.id, limit: 10, offset: 20 })).data).toEqual({ items: [], total: 0 });
  });

  it("preserves empty results without inventing a connection or accounts", async () => {
    server.use(
      http.get(api("/accounts"), ({ request }) => {
        expect(new URL(request.url).search).toBe("");
        return HttpResponse.json({ items: [], total: 0 });
      }),
      http.get(api("/metrica/connection"), () => HttpResponse.json({ counter: null })),
    );
    expect((await seo.fetchYandexAccounts()).data).toEqual({ items: [], total: 0 });
    expect((await seo.fetchMetricaConnection()).data).toEqual({ counter: null });
  });

  describe.each(operations)("$method $path", (operation) => {
    it.each([400, 403, 502])("preserves backend error detail for %s", async (status) => {
      server.use(http[operation.method](api(operation.path), () => HttpResponse.json({ detail: `error-${status}` }, { status })));
      const result = await operation.call();
      expect(isApiError<unknown>(result) && result.data.detail).toBe(`error-${status}`);
    });
    it("surfaces 401 after failed session refresh", async () => {
      server.use(
        http[operation.method](api(operation.path), () => HttpResponse.json({ detail: "Unauthorized" }, { status: 401 })),
        http.post("http://127.0.0.1/api/auth/refresh", () => HttpResponse.json({}, { status: 401 })),
      );
      const result = await operation.call();
      expect(isApiError<unknown>(result) && result.data.detail).toBe("Authentication failed");
    });
  });
});
