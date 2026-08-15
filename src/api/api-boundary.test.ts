import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import apiFetch, { addQueryParamsToUrl, apiFetchFormData } from "./client";
import { priceCreate, priceList, priceUpdate } from "./price";
import { newsCmsList, newsCreate, newsDelete } from "./news";
import { photoBatchDelete, photoList } from "./photos";
import {
  horseBreedCreate,
  horseBreedList,
  horseBreedUpdate,
} from "./horseBreeds";
import {
  horseAvailablePedigree,
  horseCreate,
  horseList,
  horseSetPedigree,
  horseUpdate,
} from "./horses";
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
const horseId = "00000000-0000-4000-8000-000000000007" as UUID;
const candidateId = "00000000-0000-4000-8000-000000000008" as UUID;

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

    await expect(
      apiFetch("/validation-error", { method: "POST" }),
    ).resolves.toEqual({
      status: "error",
      data: { detail: "Invalid payload" },
    });
  });

  it("handles CMS GET 401 through one failed refresh without retrying forever", async () => {
    let protectedCalls = 0;
    let refreshCalls = 0;
    server.use(
      http.get(apiUrl("/horses/breeds"), () => {
        protectedCalls += 1;
        return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
      }),
      http.post(apiUrl("/auth/refresh"), () => {
        refreshCalls += 1;
        return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
      }),
    );

    await expect(apiFetch("/horses/breeds")).resolves.toEqual({
      status: "error",
      data: { detail: "Authentication failed" },
    });
    expect(protectedCalls).toBe(1);
    expect(refreshCalls).toBe(1);
  });

  it("retries a CMS GET 401 request after a successful refresh without adding service key", async () => {
    let protectedCalls = 0;
    let refreshCalls = 0;
    const serviceKeyHeaders: Array<string | null> = [];
    server.use(
      http.get(apiUrl("/horses/breeds"), ({ request }) => {
        protectedCalls += 1;
        serviceKeyHeaders.push(request.headers.get("X-Equestrian-Service-Key"));
        if (protectedCalls === 1) {
          return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }
        return HttpResponse.json({
          items: [{ id: breedId, name: "Retried breed" }],
          total: 1,
        });
      }),
      http.post(apiUrl("/auth/refresh"), () => {
        refreshCalls += 1;
        return HttpResponse.json({ status: "ok" });
      }),
    );

    await expect(
      apiFetch<{ items: Array<{ id: UUID; name: string }>; total: number }>(
        "/horses/breeds",
      ),
    ).resolves.toEqual({
      status: "ok",
      data: { items: [{ id: breedId, name: "Retried breed" }], total: 1 },
    });
    expect(protectedCalls).toBe(2);
    expect(refreshCalls).toBe(1);
    expect(serviceKeyHeaders).toEqual([null, null]);
  });

  it("does not treat missing service key 400 as an auth refresh trigger", async () => {
    let readCalls = 0;
    let refreshCalls = 0;
    server.use(
      http.get(apiUrl("/horses/breeds"), () => {
        readCalls += 1;
        return HttpResponse.json(
          { detail: "Отсутствует X-Equestrian-Service-Key" },
          { status: 400 },
        );
      }),
      http.post(apiUrl("/auth/refresh"), () => {
        refreshCalls += 1;
        return HttpResponse.json({ status: "ok" });
      }),
    );

    await expect(apiFetch("/horses/breeds")).resolves.toEqual({
      status: "error",
      data: { detail: "Отсутствует X-Equestrian-Service-Key" },
    });
    expect(readCalls).toBe(1);
    expect(refreshCalls).toBe(0);
  });

  it("retries a protected form-data write after a successful refresh", async () => {
    let writeCalls = 0;
    let refreshCalls = 0;
    const contentTypes: Array<string | null> = [];
    const serviceKeyHeaders: Array<string | null> = [];
    server.use(
      http.post(apiUrl("/photos"), ({ request }) => {
        writeCalls += 1;
        contentTypes.push(request.headers.get("content-type"));
        serviceKeyHeaders.push(request.headers.get("X-Equestrian-Service-Key"));
        if (writeCalls === 1) {
          return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
        }
        return HttpResponse.json({ id: photoId, title: "Retried upload" });
      }),
      http.post(apiUrl("/auth/refresh"), () => {
        refreshCalls += 1;
        return HttpResponse.json({ status: "ok" });
      }),
    );

    const formData = new FormData();
    formData.append("title", "Retried upload");

    await expect(apiFetchFormData("/photos", formData)).resolves.toEqual({
      status: "ok",
      data: { id: photoId, title: "Retried upload" },
    });
    expect(writeCalls).toBe(2);
    expect(refreshCalls).toBe(1);
    expect(
      contentTypes.every((value) => value?.startsWith("multipart/form-data")),
    ).toBe(true);
    expect(serviceKeyHeaders).toEqual([null, null]);
  });

  it("surfaces 403 forbidden responses without claiming UI hiding is authorization", async () => {
    server.use(
      http.post(apiUrl("/prices"), () =>
        HttpResponse.json({ detail: "Forbidden" }, { status: 403 }),
      ),
    );

    await expect(
      priceCreate({ name: "Denied price", groups: [] }),
    ).resolves.toEqual({
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
        return HttpResponse.json({
          items: [{ id: "price-1", name: "Boarding" }],
          total: 1,
        });
      }),
      http.post(apiUrl("/prices"), () =>
        HttpResponse.json({ detail: "Forbidden" }, { status: 403 }),
      ),
    );

    await expect(
      priceList({ limit: 25, offset: 0, sort: ["name"] }),
    ).resolves.toMatchObject({
      status: "ok",
    });
    await expect(
      priceCreate({ name: "Boarding", groups: [] }),
    ).resolves.toMatchObject({
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

    await expect(
      priceUpdate(priceIdOne, { name: "Updated price" }),
    ).resolves.toMatchObject({
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

    await newsCmsList({
      limit: 10,
      page: 1,
      sort: "-published_at",
      status: ["deleted"],
    });
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

  it("horse breeds list serializes kind, sort and update denial is surfaced", async () => {
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

    await horseBreedList({
      limit: 25,
      offset: 50,
      sort: ["kind"],
      kind: ["pony"],
    });
    await expect(
      horseBreedUpdate(breedId, { name: "Arabian" }),
    ).resolves.toMatchObject({
      status: "error",
      data: { detail: "Forbidden" },
    });
    const params = new URL(listUrl).searchParams;
    expect(params.get("offset")).toBe("50");
    expect(params.get("kind")).toBe("pony");
    expect(params.get("sort")).toBe("kind");
  });

  it("horse breed create/update sends kind and surfaces 401/403", async () => {
    const bodies: Record<string, unknown>[] = [];
    server.use(
      http.post(apiUrl("/horses/breeds"), async ({ request }) => {
        bodies.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
      }),
      http.patch(apiUrl(`/horses/breeds/${breedId}`), async ({ request }) => {
        bodies.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({ detail: "Forbidden" }, { status: 403 });
      }),
      http.post(apiUrl("/auth/refresh"), () =>
        HttpResponse.json({ detail: "Unauthorized" }, { status: 401 }),
      ),
    );

    await expect(
      horseBreedCreate({ name: "Welsh", kind: "pony" }),
    ).resolves.toEqual({
      status: "error",
      data: { detail: "Authentication failed" },
    });
    await expect(horseBreedUpdate(breedId, { kind: "horse" })).resolves.toEqual(
      {
        status: "error",
        data: { detail: "Forbidden" },
      },
    );
    expect(bodies).toEqual([
      { name: "Welsh", kind: "pony" },
      { kind: "horse" },
    ]);
  });

  it("horse breeds protected update success returns mocked data", async () => {
    server.use(
      http.patch(apiUrl(`/horses/breeds/${breedId}`), async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: breedId, kind: "pony", ...body });
      }),
    );

    await expect(
      horseBreedUpdate(breedId, { name: "Updated breed", kind: "horse" }),
    ).resolves.toMatchObject({
      status: "ok",
      data: { id: breedId, name: "Updated breed", kind: "horse" },
    });
  });

  it("horse list keeps kind query semantics while horse create/update omit kind body", async () => {
    let listUrl = "";
    const bodies: Record<string, unknown>[] = [];
    server.use(
      http.get(apiUrl("/horses"), ({ request }) => {
        listUrl = request.url;
        return HttpResponse.json({ items: [], total: 0 });
      }),
      http.post(apiUrl("/horses"), async ({ request }) => {
        bodies.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({ id: horseId, name: "Created" });
      }),
      http.patch(apiUrl(`/horses/${horseId}`), async ({ request }) => {
        bodies.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({ id: horseId, name: "Updated" });
      }),
    );

    await horseList({ limit: 10, offset: 20, sort: ["kind"], kind: ["horse"] });
    await horseCreate({ name: "Created", sex: "male" });
    await horseUpdate(horseId, { name: "Updated" });

    const params = new URL(listUrl).searchParams;
    expect(params.get("limit")).toBe("10");
    expect(params.get("offset")).toBe("20");
    expect(params.get("sort")).toBe("kind");
    expect(params.get("kind")).toBe("horse");
    expect(params.get("page")).toBeNull();
    expect(bodies).toEqual([
      { name: "Created", sex: "male" },
      { name: "Updated" },
    ]);
    expect(bodies.every((body) => !Object.hasOwn(body, "kind"))).toBe(true);
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

    await photoList({
      limit: 50,
      offset: 0,
      price_ids: [priceIdOne, priceIdTwo],
    });
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
      http.post(
        apiUrl("/photos/batch-delete"),
        () => new HttpResponse(null, { status: 204 }),
      ),
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
    await expect(
      siteSettingUpdate(siteSettingId, { value: "new value" }),
    ).resolves.toMatchObject({
      status: "error",
      data: { detail: "Forbidden" },
    });
    expect(new URL(listUrl).searchParams.get("full")).toBe("true");
  });

  it("siteSettings protected update success returns mocked data", async () => {
    server.use(
      http.patch(
        apiUrl(`/site_settings/${siteSettingId}`),
        async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ id: siteSettingId, ...body });
        },
      ),
    );

    await expect(
      siteSettingUpdate(siteSettingId, { value: "new value" }),
    ).resolves.toMatchObject({
      status: "ok",
      data: { id: siteSettingId, value: "new value" },
    });
  });

  it("horse available pedigree serializes search limit and offset without browser fetch", async () => {
    let listUrl = "";
    server.use(
      http.get(apiUrl(`/horses/${horseId}/pedigree/sire`), ({ request }) => {
        listUrl = request.url;
        return HttpResponse.json({
          total: 1,
          items: [{ id: candidateId, name: "Candidate", sex: "male" }],
        });
      }),
    );

    await expect(
      horseAvailablePedigree(horseId, "sire", {
        search: "can",
        limit: 10,
        offset: 20,
      }),
    ).resolves.toMatchObject({
      status: "ok",
      data: { total: 1 },
    });
    const params = new URL(listUrl).searchParams;
    expect(params.get("search")).toBe("can");
    expect(params.get("limit")).toBe("10");
    expect(params.get("offset")).toBe("20");
  });

  it("horse set pedigree preserves explicit null body and handles 204", async () => {
    let body: Record<string, unknown> = {};
    server.use(
      http.post(apiUrl(`/horses/${horseId}/pedigree`), async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await expect(
      horseSetPedigree(horseId, { sire_id: null }),
    ).resolves.toMatchObject({
      status: "ok",
      data: null,
    });
    expect(body).toEqual({ sire_id: null });
  });

  it("horse pedigree endpoints surface validation and forbidden errors", async () => {
    server.use(
      http.get(apiUrl(`/horses/${horseId}/pedigree/dam`), () =>
        HttpResponse.json(
          { detail: "Invalid candidate query" },
          { status: 400 },
        ),
      ),
      http.post(apiUrl(`/horses/${horseId}/pedigree`), () =>
        HttpResponse.json({ detail: "Forbidden" }, { status: 403 }),
      ),
    );

    await expect(
      horseAvailablePedigree(horseId, "dam", { limit: 10, offset: 0 }),
    ).resolves.toEqual({
      status: "error",
      data: { detail: "Invalid candidate query" },
    });
    await expect(
      horseSetPedigree(horseId, { dam_id: candidateId }),
    ).resolves.toEqual({
      status: "error",
      data: { detail: "Forbidden" },
    });
  });

  it("horse pedigree protected write 401 follows auth handling", async () => {
    server.use(
      http.post(apiUrl(`/horses/${horseId}/pedigree`), () =>
        HttpResponse.json({ detail: "Unauthorized" }, { status: 401 }),
      ),
      http.post(apiUrl("/auth/refresh"), () =>
        HttpResponse.json({ detail: "Unauthorized" }, { status: 401 }),
      ),
    );

    await expect(horseSetPedigree(horseId, { foals: [] })).resolves.toEqual({
      status: "error",
      data: { detail: "Authentication failed" },
    });
  });
});
