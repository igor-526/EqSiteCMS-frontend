import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "@/test/msw/server";
import { callbackRequestSpamUpdate, callbackRequestStatuses, callbackRequestStatusUpdate, callbackRequestsList } from "./callbackRequests";

const base = "http://127.0.0.1/api";

describe("callback requests API boundary", () => {
  it("maps repeated filters, pagination and sort", async () => {
    server.use(http.get(`${base}/callback_requests`, ({ request }) => {
      const q = new URL(request.url).searchParams;
      expect(q.get("limit")).toBe("25"); expect(q.get("offset")).toBe("50");
      expect(q.getAll("status")).toEqual(["1", "2"]);
      expect(q.getAll("is_spam")).toEqual(["false", "true"]);
      expect(q.get("sort_by")).toBe("status"); expect(q.get("direction")).toBe("asc");
      return HttpResponse.json({ total: 0, items: [] });
    }));
    const result = await callbackRequestsList({ limit: 25, offset: 50, status: [1, 2], is_spam: [false, true], sort_by: "status", direction: "asc" });
    expect(result.status).toBe("ok");
  });

  it.each([[401, "Authentication required"], [403, "Forbidden"], [422, "Invalid regex"], [500, "Failure"]])("surfaces %s errors", async (status, detail) => {
    server.use(http.get(`${base}/callback_requests`, () => HttpResponse.json({ detail }, { status: Number(status) })));
    const result = await callbackRequestsList({ limit: 25, offset: 0 });
    expect(result.status).toBe("error");
  });

  it("loads statuses and sends narrow protected mutations", async () => {
    const seen = vi.fn();
    server.use(
      http.get(`${base}/callback_requests/statuses`, () => HttpResponse.json([{ id: 1, name: "Новая", color: "#00AA00" }])),
      http.patch(`${base}/callback_requests/:id/status`, async ({ request, params }) => { seen(params.id, await request.json()); return HttpResponse.json({ id: params.id, status: 2 }); }),
      http.patch(`${base}/callback_requests/:id/spam`, async ({ request, params }) => { seen(params.id, await request.json()); return HttpResponse.json({ id: params.id, is_spam: true, status: 2 }); }),
    );
    expect((await callbackRequestStatuses()).status).toBe("ok");
    await callbackRequestStatusUpdate("row-1", { status: 2 });
    await callbackRequestSpamUpdate("row-1", { is_spam: true });
    expect(seen).toHaveBeenNthCalledWith(1, "row-1", { status: 2 });
    expect(seen).toHaveBeenNthCalledWith(2, "row-1", { is_spam: true });
  });
});
