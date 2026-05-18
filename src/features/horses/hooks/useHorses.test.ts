import { http, HttpResponse } from "msw";
import { isApiSuccess } from "@/lib/apiStatus";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { server } from "@/test/msw/server";
import { horseList, horseCreate, horseUpdate, horseDelete, horsePhotosUpdate, horseGet } from "@/api/horses";
import {
    fetchHorseList,
    fetchCreateHorse,
    fetchUpdateHorse,
    fetchDeleteHorse,
    fetchUpdateHorsePhotos,
    fetchHorse,
} from "../services/horseService";
import { horseCreateSchema, horseUpdateSchema } from "../validators/horses";
import { useHorses } from "./useHorses";
import type { UUID } from "crypto";

const apiUrl = (path: string) => `http://127.0.0.1/api${path}`;
const horseId = "00000000-0000-4000-8000-000000000001" as UUID;

const mockHorse = {
    id: horseId,
    slug: "test-horse",
    name: "Тест",
    description: null,
    breed: null,
    coat_color: null,
    height: null,
    sex: "male" as const,
    bdate: null,
    ddate: null,
    bdate_mode: "hide" as const,
    ddate_mode: "hide" as const,
    bdate_formatted: null,
    ddate_formatted: null,
    age: null,
    horse_owner: null,
    photos: [],
    this_stable: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
};

const notificationMock = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
}));

// Mock useNotification
vi.mock("@/hooks/useNotification", () => ({
    useNotification: () => notificationMock,
}));

// ---- API boundary tests ----
describe("src/api/horses — API boundary", () => {
    it("horseList returns success data with items", async () => {
        server.use(
            http.get(apiUrl("/horses"), () =>
                HttpResponse.json({ items: [mockHorse], total: 1 }),
            ),
        );
        const result = await horseList({ limit: 25, offset: 0, pedigree: 1, this_stable: true });
        expect(result.status).toBe("ok");
        if (isApiSuccess(result)) {
            expect(result.data?.items).toHaveLength(1);
            expect(result.data?.total).toBe(1);
        }
    });

    it("horseList returns error on server failure", async () => {
        server.use(
            http.get(apiUrl("/horses"), () =>
                HttpResponse.json({ detail: "Internal server error" }, { status: 500 }),
            ),
        );
        const result = await horseList({ limit: 25, offset: 0 });
        expect(result.status).toBe("error");
    });

    it("horseCreate surfaces 400 denial without auth (backend contract)", async () => {
        server.use(
            http.post(apiUrl("/horses"), () =>
                HttpResponse.json({ detail: "Пользователь не авторизован" }, { status: 400 }),
            ),
        );
        const result = await horseCreate({ name: "Test" });
        expect(result.status).toBe("error");
        if (result.status === "error") {
            expect(result.data.detail).toContain("авторизован");
        }
    });

    it("horseCreate returns created horse on success", async () => {
        server.use(
            http.post(apiUrl("/horses"), async ({ request }) => {
                const body = (await request.json()) as Record<string, unknown>;
                return HttpResponse.json({ ...mockHorse, ...body });
            }),
        );
        const result = await horseCreate({ name: "Новая лошадь" });
        expect(result.status).toBe("ok");
    });

    it("horseUpdate surfaces 400 denial without auth", async () => {
        server.use(
            http.patch(apiUrl(`/horses/${horseId}`), () =>
                HttpResponse.json({ detail: "Пользователь не авторизован" }, { status: 400 }),
            ),
        );
        const result = await horseUpdate(horseId, { name: "Updated" });
        expect(result.status).toBe("error");
    });

    it("horseDelete surfaces 400 denial without auth", async () => {
        server.use(
            http.delete(apiUrl(`/horses/${horseId}`), () =>
                HttpResponse.json({ detail: "Пользователь не авторизован" }, { status: 400 }),
            ),
        );
        const result = await horseDelete(horseId);
        expect(result.status).toBe("error");
    });

    it("horseList serializes limit/offset and pedigree and no page param", async () => {
        let requestUrl = "";
        server.use(
            http.get(apiUrl("/horses"), ({ request }) => {
                requestUrl = request.url;
                return HttpResponse.json({ items: [], total: 0 });
            }),
        );
        await horseList({ limit: 10, offset: 20, pedigree: 1, this_stable: true });
        const params = new URL(requestUrl).searchParams;
        expect(params.get("limit")).toBe("10");
        expect(params.get("offset")).toBe("20");
        expect(params.get("pedigree")).toBe("1");
        expect(params.get("this_stable")).toBe("true");
        expect(params.get("page")).toBeNull();
    });

    it("horseGet serializes pedigree for detail fallback", async () => {
        let requestUrl = "";
        server.use(
            http.get(apiUrl("/horses/related-horse"), ({ request }) => {
                requestUrl = request.url;
                return HttpResponse.json({ ...mockHorse, slug: "related-horse" });
            }),
        );

        const result = await horseGet("related-horse", { pedigree: 1 });

        expect(result.status).toBe("ok");
        expect(new URL(requestUrl).searchParams.get("pedigree")).toBe("1");
    });
});

// ---- Feature service tests ----
describe("horseService", () => {
    it("fetchHorseList returns success response", async () => {
        server.use(
            http.get(apiUrl("/horses"), () =>
                HttpResponse.json({ items: [mockHorse], total: 1 }),
            ),
        );
        const result = await fetchHorseList({ limit: 25, offset: 0 });
        expect(result.status).toBe("ok");
    });

    it("fetchHorseList returns empty items on empty list", async () => {
        server.use(
            http.get(apiUrl("/horses"), () =>
                HttpResponse.json({ items: [], total: 0 }),
            ),
        );
        const result = await fetchHorseList({ limit: 25, offset: 0 });
        expect(result.status).toBe("ok");
        if (isApiSuccess(result)) {
            expect(result.data?.items).toHaveLength(0);
            expect(result.data?.total).toBe(0);
        }
    });

    it("fetchHorseList returns error on server failure", async () => {
        server.use(
            http.get(apiUrl("/horses"), () =>
                HttpResponse.json({ detail: "Error" }, { status: 500 }),
            ),
        );
        const result = await fetchHorseList({ limit: 25, offset: 0 });
        expect(result.status).toBe("error");
    });

    it("fetchHorse returns horse detail by slug", async () => {
        server.use(
            http.get(apiUrl("/horses/related-horse"), () =>
                HttpResponse.json({ ...mockHorse, slug: "related-horse", name: "Related" }),
            ),
        );

        const result = await fetchHorse("related-horse");
        expect(result.status).toBe("ok");
        if (isApiSuccess(result)) {
            expect(result.data?.name).toBe("Related");
        }
    });

    it("fetchCreateHorse sends correct payload", async () => {
        server.use(
            http.post(apiUrl("/horses"), async ({ request }) => {
                const body = (await request.json()) as Record<string, unknown>;
                return HttpResponse.json({ ...mockHorse, name: body.name as string });
            }),
        );
        const result = await fetchCreateHorse({ name: "Конь" });
        expect(result.status).toBe("ok");
    });

    it("fetchUpdateHorse sends PATCH request", async () => {
        server.use(
            http.patch(apiUrl(`/horses/${horseId}`), async ({ request }) => {
                const body = (await request.json()) as Record<string, unknown>;
                return HttpResponse.json({ ...mockHorse, ...body });
            }),
        );
        const result = await fetchUpdateHorse(horseId, { name: "Обновлённый" });
        expect(result.status).toBe("ok");
    });

    it("fetchDeleteHorse sends DELETE request", async () => {
        server.use(
            http.delete(apiUrl(`/horses/${horseId}`), () => new HttpResponse(null, { status: 204 })),
        );
        const result = await fetchDeleteHorse(horseId);
        expect(result.status).toBe("ok");
    });
});

// ---- Zod validation tests ----
describe("horseCreateSchema", () => {
    it("passes with a valid name", () => {
        const result = horseCreateSchema.safeParse({ name: "Буцефал" });
        expect(result.success).toBe(true);
    });

    it("fails when name is empty", () => {
        const result = horseCreateSchema.safeParse({ name: "" });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.some((i) => i.path.includes("name"))).toBe(true);
        }
    });

    it("fails when name is missing", () => {
        const result = horseCreateSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it("passes with all optional fields", () => {
        const result = horseCreateSchema.safeParse({
            name: "Лошадь",
            description: "Описание",
            sex: "male",
            this_stable: true,
            height: 160,
        });
        expect(result.success).toBe(true);
    });

    it("fails when height exceeds max", () => {
        const result = horseCreateSchema.safeParse({ name: "X", height: 400 });
        expect(result.success).toBe(false);
    });

    it("fails for invalid sex enum value", () => {
        const result = horseCreateSchema.safeParse({ name: "X", sex: "unicorn" });
        expect(result.success).toBe(false);
    });
});

describe("horseUpdateSchema", () => {
    it("passes with empty object (all fields optional)", () => {
        const result = horseUpdateSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it("passes with partial update data", () => {
        const result = horseUpdateSchema.safeParse({ name: "Updated", height: 170 });
        expect(result.success).toBe(true);
    });

    it("fails when height is out of range", () => {
        const result = horseUpdateSchema.safeParse({ height: -5 });
        expect(result.success).toBe(false);
    });
});

describe("useHorses detail navigation support", () => {
    beforeEach(() => {
        notificationMock.success.mockClear();
        notificationMock.error.mockClear();
        notificationMock.warning.mockClear();
        notificationMock.info.mockClear();
    });

    beforeEach(() => {
        server.use(
            http.get(apiUrl("/horses"), () =>
                HttpResponse.json({ items: [], total: 0 }),
            ),
        );
    });

    it("getHorseDetail performs GET detail when related horse is outside current table list", async () => {
        let requestUrl = "";
        server.use(
            http.get(apiUrl("/horses/outside-filter"), ({ request }) => {
                requestUrl = request.url;
                return HttpResponse.json({ ...mockHorse, slug: "outside-filter", name: "Outside Filter" });
            },
            ),
        );

        const { result } = renderHook(() => useHorses());
        await waitFor(() => expect(result.current.horsesLoading).toBe(false));

        let detail: Awaited<ReturnType<typeof result.current.getHorseDetail>> = null;
        await act(async () => {
            detail = await result.current.getHorseDetail("outside-filter", { pedigree: 1 });
        });

        expect(detail).toMatchObject({ name: "Outside Filter", slug: "outside-filter" });
        expect(new URL(requestUrl).searchParams.get("pedigree")).toBe("1");
    });

    it("getHorseDetail returns null on failed detail GET", async () => {
        server.use(
            http.get(apiUrl("/horses/missing-related"), () =>
                HttpResponse.json({ detail: "Лошадь не найдена" }, { status: 404 }),
            ),
        );

        const { result } = renderHook(() => useHorses());
        await waitFor(() => expect(result.current.horsesLoading).toBe(false));

        let detail: Awaited<ReturnType<typeof result.current.getHorseDetail>> = mockHorse;
        await act(async () => {
            detail = await result.current.getHorseDetail("missing-related");
        });

        expect(detail).toBeNull();
        expect(notificationMock.error).toHaveBeenCalledWith({
            title: "Ошибка",
            description: "Лошадь не найдена",
        });
    });
});

// ---- useHorses hook tests ----
describe("useHorses hook", () => {
    beforeEach(() => {
        server.use(
            http.get(apiUrl("/horses"), () =>
                HttpResponse.json({ items: [], total: 0 }),
            ),
        );
    });

    it("initial filters include this_stable=true and pedigree=1", () => {
        const { result } = renderHook(() => useHorses());
        expect(result.current.horsesFilters.this_stable).toBe(true);
        expect(result.current.horsesFilters.pedigree).toBe(1);
    });

    it("initial filters keep kind empty so it is not sent by default", () => {
        const { result } = renderHook(() => useHorses());
        expect(result.current.horsesFilters.kind).toBeUndefined();
    });

    it("initial pagination uses limit=25 and offset=0", () => {
        const { result } = renderHook(() => useHorses());
        expect(result.current.horsesFilters.limit).toBe(25);
        expect(result.current.horsesFilters.offset).toBe(0);
    });

    it("loads horses on mount (success)", async () => {
        server.use(
            http.get(apiUrl("/horses"), () =>
                HttpResponse.json({ items: [mockHorse], total: 1 }),
            ),
        );
        const { result } = renderHook(() => useHorses());
        await waitFor(() => expect(result.current.horsesLoading).toBe(false));
        expect(result.current.horses).toHaveLength(1);
        expect(result.current.horsesTotal).toBe(1);
    });

    it("returns empty list on empty response", async () => {
        const { result } = renderHook(() => useHorses());
        await waitFor(() => expect(result.current.horsesLoading).toBe(false));
        expect(result.current.horses).toHaveLength(0);
        expect(result.current.horsesTotal).toBe(0);
    });

    it("sets loading=false and horses=[] on error response", async () => {
        server.use(
            http.get(apiUrl("/horses"), () =>
                HttpResponse.json({ detail: "Error" }, { status: 500 }),
            ),
        );
        const { result } = renderHook(() => useHorses());
        await waitFor(() => expect(result.current.horsesLoading).toBe(false));
        expect(result.current.horses).toHaveLength(0);
    });

    it("setHorsesFilters resets offset to 0", () => {
        const { result } = renderHook(() => useHorses());
        act(() => {
            result.current.setHorsesFilters({ name: "test" });
        });
        expect(result.current.horsesFilters.name).toBe("test");
        expect(result.current.horsesFilters.offset).toBe(0);
    });

    it("setting breed_ids clears kind and resets offset", () => {
        const { result } = renderHook(() => useHorses());
        act(() => {
            result.current.setHorsesFilters({ kind: ["pony"] });
        });
        expect(result.current.horsesFilters.kind).toEqual(["pony"]);

        act(() => {
            result.current.setHorsesFilters({
                breed_ids: ["00000000-0000-4000-8000-000000000101" as UUID],
            });
        });

        expect(result.current.horsesFilters.breed_ids).toEqual([
            "00000000-0000-4000-8000-000000000101",
        ]);
        expect(result.current.horsesFilters.kind).toBeUndefined();
        expect(result.current.horsesFilters.offset).toBe(0);
    });

    it("clearing breed_ids keeps kind empty instead of restoring previous value", () => {
        const { result } = renderHook(() => useHorses());
        act(() => {
            result.current.setHorsesFilters({ kind: ["horse"] });
        });
        act(() => {
            result.current.setHorsesFilters({
                breed_ids: ["00000000-0000-4000-8000-000000000101" as UUID],
            });
        });
        act(() => {
            result.current.setHorsesFilters({ breed_ids: [] });
        });

        expect(result.current.horsesFilters.breed_ids).toBeUndefined();
        expect(result.current.horsesFilters.kind).toBeUndefined();
    });

    it("setHorsesLimit resets offset to 0", () => {
        const { result } = renderHook(() => useHorses());
        act(() => {
            result.current.setHorsesLimit(50);
        });
        expect(result.current.horsesFilters.limit).toBe(50);
        expect(result.current.horsesFilters.offset).toBe(0);
    });

    it("resetHorsesFilters restores default filters with this_stable=true", () => {
        const { result } = renderHook(() => useHorses());
        act(() => {
            result.current.setHorsesFilters({ name: "test", this_stable: false });
        });
        act(() => {
            result.current.resetHorsesFilters();
        });
        expect(result.current.horsesFilters.this_stable).toBe(true);
        expect(result.current.horsesFilters.name).toBeUndefined();
    });

    it("sort field change resets offset", () => {
        const { result } = renderHook(() => useHorses());
        act(() => {
            result.current.setHorsesFilters({ sort: ["name"] });
        });
        expect(result.current.horsesFilters.offset).toBe(0);
    });

    it("horseCreateSchema rejects empty name (validates before API call)", () => {
        // Validation is done via Zod schema before the API is called
        const result = horseCreateSchema.safeParse({ name: "" });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.some((i) => i.path.includes("name"))).toBe(true);
        }
    });

    // Regression: BUG 8 — setHorsesPage preserves other filters and only changes offset
    it("setHorsesPage updates offset without resetting to 0", () => {
        const { result } = renderHook(() => useHorses());
        act(() => {
            result.current.setHorsesFilters({ name: "test" });
        });
        act(() => {
            result.current.setHorsesPage(25);
        });
        expect(result.current.horsesFilters.offset).toBe(25);
        expect(result.current.horsesFilters.name).toBe("test");
    });

    // Regression: BUG 8 — setHorsesLimit resets offset and changes limit
    it("setHorsesLimit resets offset and changes limit", () => {
        const { result } = renderHook(() => useHorses());
        act(() => {
            result.current.setHorsesPage(50);
        });
        act(() => {
            result.current.setHorsesLimit(10);
        });
        expect(result.current.horsesFilters.limit).toBe(10);
        expect(result.current.horsesFilters.offset).toBe(0);
    });
});

// Regression: BUG 4 — bdate_mode uses lowercase values matching backend StrEnum
describe("HorseDateMode Zod schema — lowercase enum regression (BUG 4)", () => {
    it("passes with lowercase bdate_mode 'hide'", () => {
        const result = horseCreateSchema.safeParse({ name: "X", bdate_mode: "hide" });
        expect(result.success).toBe(true);
    });

    it("passes with lowercase bdate_mode 'y'", () => {
        const result = horseCreateSchema.safeParse({ name: "X", bdate_mode: "y" });
        expect(result.success).toBe(true);
    });

    it("passes with lowercase bdate_mode 'ym'", () => {
        const result = horseCreateSchema.safeParse({ name: "X", bdate_mode: "ym" });
        expect(result.success).toBe(true);
    });

    it("passes with lowercase bdate_mode 'ymd'", () => {
        const result = horseCreateSchema.safeParse({ name: "X", bdate_mode: "ymd" });
        expect(result.success).toBe(true);
    });

    it("fails with uppercase bdate_mode 'HIDE' (backend uses lowercase)", () => {
        const result = horseCreateSchema.safeParse({ name: "X", bdate_mode: "HIDE" });
        expect(result.success).toBe(false);
    });

    it("horseUpdateSchema passes empty object with lowercase ddate_mode", () => {
        const result = horseUpdateSchema.safeParse({ ddate_mode: "hide" });
        expect(result.success).toBe(true);
    });
});

// Regression: BUG 7 — horse photos update API boundary
describe("horsePhotosUpdate API boundary (BUG 7)", () => {
    it("sends POST request to /horses/:id/photos on success", async () => {
        server.use(
            http.post(apiUrl(`/horses/${horseId}/photos`), () =>
                HttpResponse.json(mockHorse),
            ),
        );
        const result = await horsePhotosUpdate(horseId, { photo_ids: [] });
        expect(result.status).toBe("ok");
        if (isApiSuccess(result)) {
            expect(result.data?.id).toBe(horseId);
        }
    });

    it("returns error on 400 response", async () => {
        server.use(
            http.post(apiUrl(`/horses/${horseId}/photos`), () =>
                HttpResponse.json({ detail: "Unauthorized" }, { status: 400 }),
            ),
        );
        const result = await horsePhotosUpdate(horseId, { photo_ids: [] });
        expect(result.status).toBe("error");
    });

    it("fetchUpdateHorsePhotos sends request via service", async () => {
        server.use(
            http.post(apiUrl(`/horses/${horseId}/photos`), () =>
                HttpResponse.json(mockHorse),
            ),
        );
        const result = await fetchUpdateHorsePhotos(horseId, { photo_ids: [] });
        expect(result.status).toBe("ok");
        if (isApiSuccess(result)) {
            expect(result.data?.id).toBe(horseId);
        }
    });
});
