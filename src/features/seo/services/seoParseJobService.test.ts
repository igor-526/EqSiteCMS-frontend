import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { apiError } from "@/lib/apiStatus";
import { SEO_PARSE_ERROR, startSeoParseJob } from "./seoDataService";

const base = "http://127.0.0.1/api";
const path = `${base}/seo/parse-jobs`;
const privateValue = "PRIVATE_INTERNAL_DEBUG";
const invalidBodies = [
  { label: "null", body: JSON.stringify({ detail: null, internal_debug: privateValue }) },
  { label: "false", body: JSON.stringify({ detail: false, internal_debug: privateValue }) },
  { label: "true", body: JSON.stringify({ detail: true, internal_debug: privateValue }) },
  { label: "zero", body: JSON.stringify({ detail: 0, internal_debug: privateValue }) },
  { label: "number", body: JSON.stringify({ detail: 42, internal_debug: privateValue }) },
  { label: "array", body: JSON.stringify({ detail: [privateValue] }) },
  { label: "object", body: JSON.stringify({ detail: { internal_debug: privateValue } }) },
  { label: "missing", body: JSON.stringify({ internal_debug: privateValue }) },
  { label: "empty", body: JSON.stringify({ detail: "", internal_debug: privateValue }) },
  { label: "whitespace", body: JSON.stringify({ detail: " \n\t ", internal_debug: privateValue }) },
  { label: "invalid JSON", body: `{not JSON: ${privateValue}` },
  { label: "JSON string", body: JSON.stringify(privateValue) },
  { label: "JSON null", body: "null" },
  { label: "JSON array", body: JSON.stringify([privateValue]) },
  { label: "empty response", body: "" },
];

// Real MSW → client → API → service composition: no mocked API or service.
describe.each([false, true])("QGFA-104-01 / FT-PR-02 real boundary; auth retry=%s", retry => {
  describe.each([400, 403, 502, 503])("HTTP %s", status => {
    it.each(invalidBodies)("$label becomes a constant safe message, never raw body", async ({ body }) => {
      let calls = 0;
      const refresh = vi.fn(() => new HttpResponse(null, { status: 204 }));
      server.use(http.post(`${base}/auth/refresh`, refresh), http.post(path, () => {
        calls += 1;
        return retry && calls === 1 ? new HttpResponse(null, { status: 401 })
          : new HttpResponse(body, { status, headers: { "Content-Type": "application/json" } });
      }));
      expect(await startSeoParseJob()).toEqual(apiError(status === 403 ? "Недостаточно прав" : SEO_PARSE_ERROR));
      expect(calls).toBe(retry ? 2 : 1);
      expect(refresh).toHaveBeenCalledTimes(retry ? 1 : 0);
    });

    it("preserves only allowed non-empty string detail for 400", async () => {
      let calls = 0;
      const detail = "  Счётчик не привязан  ";
      server.use(http.post(`${base}/auth/refresh`, () => new HttpResponse(null, { status: 204 })), http.post(path, () => {
        calls += 1;
        return retry && calls === 1 ? new HttpResponse(null, { status: 401 })
          : HttpResponse.json({ detail, internal_debug: privateValue }, { status });
      }));
      expect(await startSeoParseJob()).toEqual(apiError(status === 400 ? detail
        : status === 403 ? "Недостаточно прав" : SEO_PARSE_ERROR));
      expect(calls).toBe(retry ? 2 : 1);
    });
  });
});
