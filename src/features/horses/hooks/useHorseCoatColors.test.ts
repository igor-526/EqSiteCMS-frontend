import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "@/test/msw/server";
import { fetchCreateHorseCoatColor, fetchHorseCoatColorList, fetchUpdateHorseCoatColor } from "../services/horseCoatColorService";
import { horseCoatColorCreateSchema } from "../validators/horseCoatColors";
import { useHorseCoatColors } from "./useHorseCoatColors";
import type { UUID } from "crypto";

const apiUrl = (path: string) => `http://127.0.0.1/api${path}`;
const id = "00000000-0000-4000-8000-000000000201" as UUID;
const coat = { id, name: "Гнедая", short_name: "Гн.", slug: "bay", description: null,
    created_at: "2026-01-01T00:00:00Z", updated_at: null };
const notificationMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }));
vi.mock("@/hooks/useNotification", () => ({ useNotification: () => notificationMock }));

describe("horse coat short-name API boundary", () => {
    beforeEach(() => server.use(http.get(apiUrl("/horses/coat_colors"), () => HttpResponse.json({ items: [], total: 0 }))));

    it("serializes short-name query with limit/offset and returns success/empty", async () => {
        let url = "";
        server.use(http.get(apiUrl("/horses/coat_colors"), ({ request }) => { url = request.url; return HttpResponse.json({ items: [coat], total: 1 }); }));
        const response = await fetchHorseCoatColorList({ short_name: "гн", sort: ["-short_name"], limit: 10, offset: 20 });
        expect(response).toMatchObject({ status: "ok", data: { total: 1 } });
        const params = new URL(url).searchParams;
        expect(Object.fromEntries(params)).toMatchObject({ short_name: "гн", sort: "-short_name", limit: "10", offset: "20" });
    });

    it("serializes create/update bodies including empty value", async () => {
        const bodies: unknown[] = [];
        server.use(
            http.post(apiUrl("/horses/coat_colors"), async ({ request }) => { bodies.push(await request.json()); return HttpResponse.json(coat); }),
            http.patch(apiUrl(`/horses/coat_colors/${id}`), async ({ request }) => { bodies.push(await request.json()); return HttpResponse.json(coat); }),
        );
        await fetchCreateHorseCoatColor({ name: "Гнедая", short_name: "Гн." });
        await fetchUpdateHorseCoatColor(id, { short_name: "" });
        expect(bodies).toEqual([{ name: "Гнедая", short_name: "Гн." }, { short_name: "" }]);
    });

    it.each([401, 403, 422, 500])("surfaces HTTP %s as API error", async (status) => {
        server.use(http.post(apiUrl("/horses/coat_colors"), () => HttpResponse.json({ detail: "denied" }, { status })));
        await expect(fetchCreateHorseCoatColor({ name: "Гнедая", short_name: "Гн." })).resolves.toMatchObject({ status: "error" });
    });

    it("validates 63 characters and rejects 64", () => {
        expect(horseCoatColorCreateSchema.safeParse({ name: "Гнедая", short_name: "г".repeat(63) }).success).toBe(true);
        expect(horseCoatColorCreateSchema.safeParse({ name: "Гнедая", short_name: "г".repeat(64) }).success).toBe(false);
    });

    it("resets offset for search/sort/page-size but preserves page changes", async () => {
        const { result } = renderHook(() => useHorseCoatColors());
        await waitFor(() => expect(result.current.horseCoatColorsLoading).toBe(false));
        act(() => result.current.setHorseCoatColorsFilters((prev) => ({ ...prev, offset: 50 })));
        expect(result.current.horseCoatColorsFilters.offset).toBe(50);
        act(() => result.current.setHorseCoatColorsFilters((prev) => ({ ...prev, short_name: "гн", offset: 50 })));
        expect(result.current.horseCoatColorsFilters.offset).toBe(0);
        act(() => result.current.setHorseCoatColorsFilters((prev) => ({ ...prev, sort: ["short_name"], offset: 50 })));
        expect(result.current.horseCoatColorsFilters.offset).toBe(0);
        act(() => result.current.setHorseCoatColorsFilters((prev) => ({ ...prev, limit: 50, offset: 25 })));
        expect(result.current.horseCoatColorsFilters).toMatchObject({ limit: 50, offset: 0 });
    });
});
