import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import apiFetch, { addQueryParamsToUrl } from "./client";
import { priceCreate, priceList, priceUpdate } from "./price";
import { newsCmsList, newsCreate, newsDelete } from "./news";
import { photoBatchDelete, photoList } from "./photos";
import { horseBreedList, horseBreedUpdate } from "./horseBreeds";
import { siteSettingList, siteSettingUpdate } from "./siteSettings";
import { server } from "@/test/msw/server";
import type { UUID } from "crypto";

const apiUrl = (path: string) => `http://127.0.0.1/api${path}`;
const newsId = "00000000-0000-4000-8000-000000000001" as UUID;
const breedId = "00000000-0000-4000-8000-000000000002" as UUID;
const priceIdOne = "00000000-0000-4000-8000-000000000003" as UUID;
const priceIdTwo = "00000000-0000-4000-8000-000000000004" as UUID;
const photoId = "00000000-0000-4000-8000-000000000005" as UUID;
const siteSettingId = "00000000-0000-4000-8000-000000000006" as UUID;

describe("API query serialization", () => {
  it("serializes limit, offset, sort arrays and filters without page-based API params", () => {
    const url = addQueryParamsToUrl("/prices?existing=1#hash", {
      limit: 25,
      offset: 50,
      sort: ["name", "-created_at"],
      name: "boarding",
      empty: undefined,
      none: null,
    });

    expect(url).toBe(
      "/prices?existing=1&limit=25&offset=50&sort=name&sort=-created_at&name=boarding#hash",
    );
    expect(url).not.toContain("page=");
  });

  it("uses limit and offset when price list calls the CMS API boundary", async () => {
    let requestUrl = "";
    server.use(
      http.get(apiUrl("/prices"), ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json({ items: [], total: 0 });
      }),
    );

    await priceList({ limit: 10, offset: 20, sort: ["-name"], name: "hay" });

    const params = new URL(requestUrl).searchParams;
    expect(params.get("limit")).toBe("10");
    expect(params.get("offset")).toBe("20");
    expect(params.getAll("sort")).toEqual(["-name"]);
    expect(params.get("name")).toBe("hay");
    expect(params.get("page")).toBeNull();
  });
});

describe("API boundary auth and protected write behavior", () => {
  it("returns success data for handled mocked requests", async () => {
    server.use(
      http.get(apiUrl("/ok"), () => HttpResponse.json({ value: "mocked" })),
    );

    await expect(apiFetch<{ value: string }>("/ok")).resolves.toEqual({
      status: "ok",
      data: { value: "mocked" },
    });
  });

  it("surfaces non-auth errors from the backend detail", async () => {
    server.use(
      http.get(apiUrl("/server-error"), () =>
        HttpResponse.json({ detail: "Backend unavailable" }, { status: 500 }),
      ),
    );

    await expect(apiFetch("/server-error")).resolves.toEqual({
      status: "error",
      data: { detail: "Backend unavailable" },
    });
  });

  it("surfaces validation errors from the backend detail", async () => {
    server.use(
      http.post(apiUrl("/validation-error"), () =>
        HttpResponse.json({ detail: "Invalid payload" }, { status: 422 }),
      ),
    );

    await expect(apiFetch("/validation-error", { method: "POST" })).resolves.toEqual({
      status: "error",
      data: { detail: "Invalid payload" },
    });
  });

  it("handles 401 through refresh and reports authentication failure", async () => {
    server.use(
      http.get(apiUrl("/protected"), () =>
        HttpResponse.json({ detail: "Unauthorized" }, { status: 401 }),
      ),
      http.post(apiUrl("/auth/refresh"), () =>
        HttpResponse.json({ detail: "Unauthorized" }, { status: 401 }),
      ),
    );

    await expect(apiFetch("/protected")).resolves.toEqual({
      status: "error",
      data: { detail: "Authentication failed" },
    });
  });

  it("retries a 401 request after a successful refresh", async () => {
    let protectedCalls = 0;
    server.use(
      http.get(apiUrl("/protected"), () => {
        protectedCalls += 1;
        if (protectedCalls === 1) {
          return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }
        return HttpResponse.json({ value: "retried" });
      }),
      http.post(apiUrl("/auth/refresh"), () => HttpResponse.json({ status: "ok" })),
    );

    await expect(apiFetch<{ value: string }>("/protected")).resolves.toEqual({
      status: "ok",
      data: { value: "retried" },
    });
    expect(protectedCalls).toBe(2);
  });

  it("surfaces 403 forbidden responses without claiming UI hiding is authorization", async () => {
    server.use(
      http.post(apiUrl("/prices"), () =>
        HttpResponse.json({ detail: "Forbidden" }, { status: 403 }),
      ),
    );

    await expect(priceCreate({ name: "Denied price", groups: [] })).resolves.toEqual({
      status: "error",
      data: { detail: "Forbidden" },
    });
  });

  it("blocks unhandled real network requests through MSW", async () => {
    await expect(apiFetch("/unhandled-live-backend")).resolves.toEqual({
      status: "error",
      data: { detail: "Network error or invalid JSON" },
    });
  });
});

describe("P2 feature service boundaries", () => {
  it("prices list serializes filters and protected create surfaces denial", async () => {
    let listUrl = "";
    server.use(
      http.get(apiUrl("/prices"), ({ request }) => {
        listUrl = request.url;
        return HttpResponse.json({ items: [{ id: "price-1", name: "Boarding" }], total: 1 });
      }),
      http.post(apiUrl("/prices"), () =>
        HttpResponse.json({ detail: "Forbidden" }, { status: 403 }),
      ),
    );

    await expect(priceList({ limit: 25, offset: 0, sort: ["name"] })).resolves.toMatchObject({
      status: "ok",
    });
    await expect(priceCreate({ name: "Boarding", groups: [] })).resolves.toMatchObject({
      status: "error",
      data: { detail: "Forbidden" },
    });
    expect(new URL(listUrl).searchParams.getAll("sort")).toEqual(["name"]);
  });

  it("prices protected update success returns mocked data", async () => {
    server.use(
      http.patch(apiUrl(`/prices/${priceIdOne}`), async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: priceIdOne, ...body });
      }),
    );

    await expect(priceUpdate(priceIdOne, { name: "Updated price" })).resolves.toMatchObject({
      status: "ok",
      data: { id: priceIdOne, name: "Updated price" },
    });
  });

  it("news CMS list serializes sort/filter and delete denial is surfaced", async () => {
    let listUrl = "";
    server.use(
      http.get(apiUrl("/news-cms"), ({ request }) => {
        listUrl = request.url;
        return HttpResponse.json({ items: [], total: 0 });
      }),
      http.delete(apiUrl(`/news/${newsId}`), () =>
        HttpResponse.json({ detail: "Forbidden" }, { status: 403 }),
      ),
    );

    await newsCmsList({ limit: 10, page: 1, sort: "-published_at", status: ["deleted"] });
    await expect(newsDelete(newsId)).resolves.toMatchObject({
      status: "error",
      data: { detail: "Forbidden" },
    });
    expect(new URL(listUrl).searchParams.get("status")).toBe("deleted");
    expect(new URL(listUrl).searchParams.get("sort")).toBe("-published_at");
  });

  it("news protected create success returns mocked data", async () => {
    server.use(
      http.post(apiUrl("/news"), async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: newsId, ...body });
      }),
    );

    await expect(
      newsCreate({
        name: "New CMS item",
        content: "Body",
        published_at: "2026-05-11T00:00:00.000Z",
      }),
    ).resolves.toMatchObject({
      status: "ok",
      data: { id: newsId, name: "New CMS item" },
    });
  });

  it("horses list serializes limit/offset and update denial is surfaced", async () => {
    let listUrl = "";
    server.use(
      http.get(apiUrl("/horses/breeds"), ({ request }) => {
        listUrl = request.url;
        return HttpResponse.json({ items: [], total: 0 });
      }),
      http.patch(apiUrl(`/horses/breeds/${breedId}`), () =>
        HttpResponse.json({ detail: "Forbidden" }, { status: 403 }),
      ),
    );

    await horseBreedList({ limit: 25, offset: 50, sort: ["name"] });
    await expect(horseBreedUpdate(breedId, { name: "Arabian" })).resolves.toMatchObject({
      status: "error",
      data: { detail: "Forbidden" },
    });
    expect(new URL(listUrl).searchParams.get("offset")).toBe("50");
  });

  it("horses protected update success returns mocked data", async () => {
    server.use(
      http.patch(apiUrl(`/horses/breeds/${breedId}`), async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: breedId, ...body });
      }),
    );

    await expect(horseBreedUpdate(breedId, { name: "Updated breed" })).resolves.toMatchObject({
      status: "ok",
      data: { id: breedId, name: "Updated breed" },
    });
  });

  it("gallery list serializes multi-value filters and batch delete denial is surfaced", async () => {
    let listUrl = "";
    server.use(
      http.get(apiUrl("/photos"), ({ request }) => {
        listUrl = request.url;
        return HttpResponse.json({ items: [], total: 0 });
      }),
      http.post(apiUrl("/photos/batch-delete"), () =>
        HttpResponse.json({ detail: "Forbidden" }, { status: 403 }),
      ),
    );

    await photoList({ limit: 50, offset: 0, price_ids: [priceIdOne, priceIdTwo] });
    await expect(photoBatchDelete({ ids: [photoId] })).resolves.toMatchObject({
      status: "error",
      data: { detail: "Forbidden" },
    });
    expect(new URL(listUrl).searchParams.getAll("price_ids")).toEqual([
      priceIdOne,
      priceIdTwo,
    ]);
  });

  it("gallery protected batch delete success handles empty response body", async () => {
    server.use(
      http.post(apiUrl("/photos/batch-delete"), () => new HttpResponse(null, { status: 204 })),
    );

    await expect(photoBatchDelete({ ids: [photoId] })).resolves.toMatchObject({
      status: "ok",
      data: null,
    });
  });

  it("siteSettings list serializes full flag and update denial is surfaced", async () => {
    let listUrl = "";
    server.use(
      http.get(apiUrl("/site_settings"), ({ request }) => {
        listUrl = request.url;
        return HttpResponse.json({ items: [], total: 0 });
      }),
      http.patch(apiUrl(`/site_settings/${siteSettingId}`), () =>
        HttpResponse.json({ detail: "Forbidden" }, { status: 403 }),
      ),
    );

    await siteSettingList({ limit: 25, offset: 0, full: true, sort: ["key"] });
    await expect(siteSettingUpdate(siteSettingId, { value: "new value" })).resolves.toMatchObject({
      status: "error",
      data: { detail: "Forbidden" },
    });
    expect(new URL(listUrl).searchParams.get("full")).toBe("true");
  });

  it("siteSettings protected update success returns mocked data", async () => {
    server.use(
      http.patch(apiUrl(`/site_settings/${siteSettingId}`), async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: siteSettingId, ...body });
      }),
    );

    await expect(siteSettingUpdate(siteSettingId, { value: "new value" })).resolves.toMatchObject({
      status: "ok",
      data: { id: siteSettingId, value: "new value" },
    });
  });
});
