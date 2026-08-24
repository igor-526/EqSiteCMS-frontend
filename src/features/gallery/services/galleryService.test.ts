import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@/test/msw/server";
import { photoCreate, photoDelete, photoList } from "@/api/photos";
import type { UUID } from "crypto";

const API = "http://127.0.0.1/api";
const photoId = "00000000-0000-4000-8000-000000000001" as UUID;

describe("gallery API boundary with MSW", () => {
  beforeEach(() => {
    server.use(
      http.post(`${API}/auth/refresh`, () =>
        HttpResponse.json({ detail: "Unauthorized" }, { status: 401 }),
      ),
    );
  });

  it("returns an empty gallery and serializes limit/offset", async () => {
    let requestUrl = "";
    server.use(
      http.get(`${API}/photos`, ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json({ items: [], total: 0 });
      }),
    );
    const result = await photoList({ limit: 50, offset: 0 });
    expect(result).toEqual({ status: "ok", data: { items: [], total: 0 } });
    const params = new URL(requestUrl).searchParams;
    expect(params.get("limit")).toBe("50");
    expect(params.get("offset")).toBe("0");
    expect(params.has("page")).toBe(false);
  });

  it("uploads a long filename successfully without client truncation", async () => {
    const longName = `${"ф".repeat(100)}.jpg`;
    server.use(
      http.post(`${API}/photos`, () => {
        return HttpResponse.json({ id: photoId, name: "bounded.jpg", url: "/photo" });
      }),
    );
    const result = await photoCreate({
      file: new File(["image"], longName, { type: "image/jpeg" }),
      name: longName,
    });
    expect(result.status).toBe("ok");
  });

  it.each([
    [422, "Некорректный файл"],
    [500, "Ошибка сервера"],
  ])("surfaces upload error %s", async (status, detail) => {
    server.use(
      http.post(`${API}/photos`, () =>
        HttpResponse.json({ detail }, { status }),
      ),
    );
    const result = await photoCreate({ file: new File(["bad"], "bad.jpg") });
    expect(result).toEqual({ status: "error", data: { detail } });
  });

  it.each([
    [401, "Authentication failed"],
    [403, "Недостаточно прав"],
  ])("surfaces Protected DELETE denial %s", async (status, detail) => {
    server.use(
      http.delete(`${API}/photos/${photoId}`, () =>
        HttpResponse.json({ detail }, { status }),
      ),
    );
    const result = await photoDelete(photoId);
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.data.detail).toBe(detail);
  });
});
