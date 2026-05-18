import { http, HttpResponse } from "msw";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { horseBreedCreateSchema, horseBreedUpdateSchema } from "../validators/horseBreeds";
import { fetchCreateHorseBreed, fetchHorseBreedList, fetchUpdateHorseBreed } from "../services/horseBreedsService";
import { useHorseBreeds } from "./useHorseBreeds";
import { server } from "@/test/msw/server";
import type { UUID } from "crypto";

const apiUrl = (path: string) => `http://127.0.0.1/api${path}`;
const breedId = "00000000-0000-4000-8000-000000000101" as UUID;

const mockBreed = {
    id: breedId,
    name: "Арабская",
    slug: "arabian",
    description: null,
    kind: "horse" as const,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
};

const notificationMock = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
}));

vi.mock("@/hooks/useNotification", () => ({
    useNotification: () => notificationMock,
}));

describe("horseBreed validators", () => {
    it("defaults create kind to horse", () => {
        const result = horseBreedCreateSchema.safeParse({ name: "Уэльская", slug: "" });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.kind).toBe("horse");
        }
    });

    it("accepts pony kind on create/update and rejects invalid values", () => {
        expect(horseBreedCreateSchema.safeParse({ name: "Уэльская", kind: "pony" }).success).toBe(true);
        expect(horseBreedUpdateSchema.safeParse({ kind: "pony" }).success).toBe(true);
        expect(horseBreedCreateSchema.safeParse({ name: "X", kind: "cat" }).success).toBe(false);
    });
});

describe("horseBreedsService", () => {
    it("fetchHorseBreedList serializes kind and sort", async () => {
        let requestUrl = "";
        server.use(
            http.get(apiUrl("/horses/breeds"), ({ request }) => {
                requestUrl = request.url;
                return HttpResponse.json({ items: [mockBreed], total: 1 });
            }),
        );

        const result = await fetchHorseBreedList({
            limit: 25,
            offset: 0,
            kind: ["horse"],
            sort: ["kind"],
        });

        expect(result.status).toBe("ok");
        const params = new URL(requestUrl).searchParams;
        expect(params.get("kind")).toBe("horse");
        expect(params.get("sort")).toBe("kind");
    });

    it("fetchCreateHorseBreed and fetchUpdateHorseBreed send kind", async () => {
        const bodies: Record<string, unknown>[] = [];
        server.use(
            http.post(apiUrl("/horses/breeds"), async ({ request }) => {
                bodies.push((await request.json()) as Record<string, unknown>);
                return HttpResponse.json({ ...mockBreed, kind: "pony" });
            }),
            http.patch(apiUrl(`/horses/breeds/${breedId}`), async ({ request }) => {
                bodies.push((await request.json()) as Record<string, unknown>);
                return HttpResponse.json({ ...mockBreed, kind: "horse" });
            }),
        );

        await expect(fetchCreateHorseBreed({ name: "Уэльская", kind: "pony" })).resolves.toMatchObject({
            status: "ok",
        });
        await expect(fetchUpdateHorseBreed(breedId, { kind: "horse" })).resolves.toMatchObject({
            status: "ok",
        });
        expect(bodies).toEqual([
            { name: "Уэльская", kind: "pony" },
            { kind: "horse" },
        ]);
    });
});

describe("useHorseBreeds hook", () => {
    beforeEach(() => {
        notificationMock.success.mockClear();
        notificationMock.error.mockClear();
        server.use(
            http.get(apiUrl("/horses/breeds"), () =>
                HttpResponse.json({ items: [], total: 0 }),
            ),
        );
    });

    it("loads an empty list with default limit/offset", async () => {
        const { result } = renderHook(() => useHorseBreeds());
        await waitFor(() => expect(result.current.horseBreedsLoading).toBe(false));

        expect(result.current.horseBreeds).toEqual([]);
        expect(result.current.horseBreedsFilters.limit).toBe(25);
        expect(result.current.horseBreedsFilters.offset).toBe(0);
        expect(result.current.horseBreedsFilters.kind).toBeUndefined();
    });

    it("applies and clears kind filter with offset reset", () => {
        const { result } = renderHook(() => useHorseBreeds());

        act(() => {
            result.current.setHorseBreedsFilters((prev) => ({
                ...prev,
                offset: 50,
                kind: ["pony"],
            }));
        });
        expect(result.current.horseBreedsFilters.kind).toEqual(["pony"]);
        expect(result.current.horseBreedsFilters.offset).toBe(0);

        act(() => {
            result.current.setHorseBreedsFilters((prev) => ({
                ...prev,
                kind: [],
                offset: 0,
            }));
        });
        expect(result.current.horseBreedsFilters.kind).toBeUndefined();
        expect(result.current.horseBreedsFilters.offset).toBe(0);
    });

    it("keeps kind sort values and resets offset on page size change", () => {
        const { result } = renderHook(() => useHorseBreeds());

        act(() => {
            result.current.setHorseBreedsFilters((prev) => ({
                ...prev,
                sort: ["-kind"],
                offset: 0,
            }));
        });
        expect(result.current.horseBreedsFilters.sort).toEqual(["-kind"]);

        act(() => {
            result.current.setHorseBreedsFilters((prev) => ({
                ...prev,
                limit: 50,
                offset: 25,
            }));
        });
        expect(result.current.horseBreedsFilters.limit).toBe(50);
        expect(result.current.horseBreedsFilters.offset).toBe(0);
    });

    it("loads selector options by kind without live backend", async () => {
        let requestUrl = "";
        server.use(
            http.get(apiUrl("/horses/breeds"), ({ request }) => {
                requestUrl = request.url;
                return HttpResponse.json({ items: [{ ...mockBreed, kind: "pony" }], total: 1 });
            }),
        );
        const { result } = renderHook(() => useHorseBreeds());
        await waitFor(() => expect(result.current.horseBreedsLoading).toBe(false));

        await act(async () => {
            await result.current.loadHorseBreedSelectorOptions(["pony"]);
        });

        expect(result.current.horseBreedSelectorOptions).toHaveLength(1);
        const params = new URL(requestUrl).searchParams;
        expect(params.get("kind")).toBe("pony");
        expect(params.get("limit")).toBe("100");
        expect(params.get("offset")).toBe("0");
    });
});
