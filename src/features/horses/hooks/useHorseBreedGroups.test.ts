import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, useEffect } from "react";
import { server } from "@/test/msw/server";
import { fetchCreateHorseBreedGroup, fetchHorseBreedGroupList, fetchUpdateHorseBreedGroup } from "../services/horseBreedGroupsService";
import { useHorseBreedGroups } from "./useHorseBreedGroups";
import { fetchBreedGroupPageData, saveBreedGroupPageData } from "@/features/pageEditor/services/breedGroupPageDataService";

const apiUrl = (path: string) => `http://127.0.0.1/api${path}`;
const group = { id: "00000000-0000-4000-8000-000000000201", name: "Верховые", slug: "verhovye", created_at: "2026-01-01", updated_at: null };
const notification = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("@/hooks/useNotification", () => ({ useNotification: () => notification }));

describe("horse breed groups API/service", () => {
  it("serializes list pagination, filters and sort", async () => {
    let url = "";
    server.use(http.get(apiUrl("/horses/breed-groups"), ({ request }) => { url = request.url; return HttpResponse.json({ items: [group], total: 1 }); }));
    await expect(fetchHorseBreedGroupList({ limit: 25, offset: 50, name: "верх", sort: ["-created_at"] })).resolves.toMatchObject({ status: "ok" });
    const params = new URL(url).searchParams;
    expect(params.get("limit")).toBe("25"); expect(params.get("offset")).toBe("50"); expect(params.get("name")).toBe("верх"); expect(params.get("sort")).toBe("-created_at");
  });

  it("sends create/update payloads", async () => {
    const bodies: unknown[] = [];
    server.use(
      http.post(apiUrl("/horses/breed-groups"), async ({ request }) => { bodies.push(await request.json()); return HttpResponse.json(group); }),
      http.patch(apiUrl(`/horses/breed-groups/${group.id}`), async ({ request }) => { bodies.push(await request.json()); return HttpResponse.json(group); }),
    );
    await fetchCreateHorseBreedGroup({ name: "Верховые", slug: "" });
    await fetchUpdateHorseBreedGroup(group.id, { name: "Спортивные" });
    expect(bodies).toEqual([{ name: "Верховые", slug: "" }, { name: "Спортивные" }]);
  });

  it.each([400, 401, 403, 500])("surfaces HTTP %s without live backend", async (status) => {
    server.use(http.post(apiUrl("/horses/breed-groups"), () => HttpResponse.json({ detail: "denied" }, { status })));
    await expect(fetchCreateHorseBreedGroup({ name: "Верховые" })).resolves.toMatchObject({ status: "error" });
  });

  it("loads and saves Page Editor HTML without photo endpoints", async () => {
    let pageFlag = ""; let body: unknown;
    server.use(
      http.get(apiUrl(`/horses/breed-groups/${group.id}`), ({ request }) => { pageFlag = new URL(request.url).searchParams.get("page_data") ?? ""; return HttpResponse.json({ ...group, page_data: "<div>Text</div>" }); }),
      http.patch(apiUrl(`/horses/breed-groups/${group.id}`), async ({ request }) => { body = await request.json(); return HttpResponse.json({ ...group, page_data: "<div>Saved</div>" }); }),
    );
    await expect(fetchBreedGroupPageData(group.id)).resolves.toMatchObject({ status: "ok" });
    await expect(saveBreedGroupPageData(group.id, "<div>Saved</div>")).resolves.toMatchObject({ status: "ok" });
    expect(pageFlag).toBe("true"); expect(body).toEqual({ page_data: "<div>Saved</div>" });
  });
});

describe("useHorseBreedGroups", () => {
  beforeEach(() => { notification.success.mockClear(); notification.error.mockClear(); server.use(http.get(apiUrl("/horses/breed-groups"), () => HttpResponse.json({ items: [], total: 0 }))); });
  it("loads empty initial page with limit 25, offset 0 and default sort", async () => {
    const { result } = renderHook(() => useHorseBreedGroups());
    await waitFor(() => expect(result.current.horseBreedGroupsLoading).toBe(false));
    expect(result.current.horseBreedGroups).toEqual([]); expect(result.current.horseBreedGroupsFilters).toMatchObject({ limit: 25, offset: 0, sort: ["-created_at"] });
  });
  it("keeps reset callbacks stable and does not loop while the open modal resets validation", async () => {
    let renders = 0;
    const OpenModalEffect = ({ onResetValidation }: { onResetValidation: () => void }) => {
      useEffect(() => { onResetValidation(); }, [onResetValidation]);
      return createElement("span", { "data-testid": "modal-open" }, "open");
    };
    const Harness = () => {
      const groups = useHorseBreedGroups();
      renders += 1;
      return createElement(OpenModalEffect, { onResetValidation: groups.resetHorseBreedGroupsValidation });
    };
    render(createElement(Harness));
    await waitFor(() => expect(screen.getByTestId("modal-open")).toBeInTheDocument());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(renders).toBeLessThan(10);

    const { result, rerender } = renderHook(() => useHorseBreedGroups());
    const resetValidation = result.current.resetHorseBreedGroupsValidation;
    const resetFilters = result.current.resetHorseBreedGroupsFilters;
    rerender();
    expect(result.current.resetHorseBreedGroupsValidation).toBe(resetValidation);
    expect(result.current.resetHorseBreedGroupsFilters).toBe(resetFilters);
  });
  it("keeps page change and resets offset on page-size change", () => {
    const { result } = renderHook(() => useHorseBreedGroups());
    act(() => result.current.setHorseBreedGroupsFilters((prev) => ({ ...prev, offset: 25 })));
    expect(result.current.horseBreedGroupsFilters.offset).toBe(25);
    act(() => result.current.setHorseBreedGroupsFilters((prev) => ({ ...prev, limit: 50, offset: 25 })));
    expect(result.current.horseBreedGroupsFilters).toMatchObject({ limit: 50, offset: 0 });
  });
  it("normalizes filters and resets offset for filter/sort changes", () => {
    const { result } = renderHook(() => useHorseBreedGroups());
    act(() => result.current.setHorseBreedGroupsFilters((prev) => ({ ...prev, offset: 50, name: "  верх  " })));
    expect(result.current.horseBreedGroupsFilters).toMatchObject({ name: "верх", offset: 0 });
    act(() => result.current.setHorseBreedGroupsFilters((prev) => ({ ...prev, offset: 50, name: " ", sort: ["name"] })));
    expect(result.current.horseBreedGroupsFilters.name).toBeUndefined(); expect(result.current.horseBreedGroupsFilters.offset).toBe(0);
  });
  it("validates create locally and invalidates list after success", async () => {
    let listCalls = 0;
    server.use(
      http.get(apiUrl("/horses/breed-groups"), () => { listCalls += 1; return HttpResponse.json({ items: [], total: 0 }); }),
      http.post(apiUrl("/horses/breed-groups"), () => HttpResponse.json(group)),
    );
    const { result } = renderHook(() => useHorseBreedGroups()); await waitFor(() => expect(result.current.horseBreedGroupsLoading).toBe(false));
    await act(() => result.current.createHorseBreedGroup({ name: " " })); expect(result.current.horseBreedGroupsValidationErrors.name).toBeDefined();
    await act(() => result.current.createHorseBreedGroup({ name: "Верховые" })); await waitFor(() => expect(listCalls).toBeGreaterThan(1)); expect(notification.success).toHaveBeenCalled();
  });
});
