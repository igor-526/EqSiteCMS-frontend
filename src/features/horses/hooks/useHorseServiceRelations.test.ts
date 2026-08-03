import { http, HttpResponse } from "msw";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHorseServiceRelations } from "./useHorseServiceRelations";
import { server } from "@/test/msw/server";
import type { UUID } from "crypto";
import { HorseServiceRelationsDrawer } from "../ui/HorseServiceRelations/HorseServiceRelationsDrawer";
import { createElement } from "react";

const apiUrl = (path: string) => `http://127.0.0.1/api${path}`;
const horseId = "00000000-0000-4000-8000-000000000001" as UUID;
const relationId = "00000000-0000-4000-8000-000000000002" as UUID;
const serviceId = "00000000-0000-4000-8000-000000000003" as UUID;

const mockRelation = {
    id: relationId,
    horse_id: horseId,
    service_id: serviceId,
    name: "Ковка",
    slug: "horseshoeing",
    description: null,
    price: 5000,
    price_formatter: "equal",
};

const mockAvailableService = {
    id: serviceId,
    name: "Ковка",
    slug: "horseshoeing",
    description: "Стандартная ковка",
    price: 5000,
    price_formatter: "equal",
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

describe("useHorseServiceRelations hook", () => {
    beforeEach(() => {
        notificationMock.success.mockClear();
        notificationMock.error.mockClear();
        server.use(
            http.get(apiUrl(`/horses/${horseId}/services`), () =>
                HttpResponse.json({ items: [mockRelation], total: 1 }),
            ),
            http.get(apiUrl(`/horses/${horseId}/available-services`), () =>
                HttpResponse.json([mockAvailableService]),
            ),
            http.post(apiUrl(`/horses/${horseId}/services`), () =>
                HttpResponse.json(mockRelation),
            ),
            http.patch(apiUrl(`/horses/${horseId}/services/${relationId}`), () =>
                HttpResponse.json(mockRelation),
            ),
            http.delete(apiUrl(`/horses/${horseId}/services/${relationId}`), () =>
                HttpResponse.json(null),
            ),
        );
    });

    it("loads relations on openDrawer", async () => {
        const { result } = renderHook(() => useHorseServiceRelations());

        act(() => {
            result.current.openDrawer(horseId, "Буцефал");
        });

        await waitFor(() => expect(result.current.relationsLoading).toBe(false));

        expect(result.current.drawerOpen).toBe(true);
        expect(result.current.selectedHorseId).toBe(horseId);
        expect(result.current.selectedHorseName).toBe("Буцефал");
        expect(result.current.relations).toHaveLength(1);
        expect(result.current.relations[0].name).toBe("Ковка");
        expect(result.current.relationsTotal).toBe(1);
    });

    it("renders Drawer rows from the paginated relation response contract", async () => {
        let relationRequestUrl = "";
        server.use(
            http.get(apiUrl(`/horses/${horseId}/services`), ({ request }) => {
                relationRequestUrl = request.url;
                return HttpResponse.json({ items: [mockRelation], total: 1 });
            }),
        );
        const Harness = () => {
            const state = useHorseServiceRelations();
            return createElement("div", null,
                createElement("button", {
                    type: "button",
                    onClick: () => state.openDrawer(horseId, "Буцефал"),
                }, "Open services"),
                createElement(HorseServiceRelationsDrawer, {
                    open: state.drawerOpen,
                    onClose: state.closeDrawer,
                    horseName: state.selectedHorseName,
                    relations: state.relations,
                    loading: state.relationsLoading,
                    onAdd: state.openCreateModal,
                    onRowClick: state.openUpdateModal,
                }),
            );
        };
        render(createElement(Harness));
        fireEvent.click(screen.getByRole("button", { name: "Open services" }));
        expect(await screen.findByText("Услуги: Буцефал")).toBeInTheDocument();
        expect(await screen.findByText("Ковка")).toBeInTheDocument();
        expect(screen.getByText("5000 ₽")).toBeInTheDocument();
        const params = new URL(relationRequestUrl).searchParams;
        expect(params.get("limit")).toBe("100");
        expect(params.get("offset")).toBe("0");
    });

    it("loads available services on openCreateModal", async () => {
        const { result } = renderHook(() => useHorseServiceRelations());

        act(() => {
            result.current.openDrawer(horseId, "Буцефал");
        });
        await waitFor(() => expect(result.current.relationsLoading).toBe(false));

        act(() => {
            result.current.openCreateModal();
        });

        await waitFor(() => expect(result.current.availableServicesLoading).toBe(false));

        expect(result.current.modalOpen).toBe(true);
        expect(result.current.selectedRelation).toBeNull();
        expect(result.current.availableServices).toHaveLength(1);
        expect(result.current.availableServices[0].name).toBe("Ковка");
    });

    it("creates a relation and reloads list", async () => {
        const { result } = renderHook(() => useHorseServiceRelations());

        act(() => {
            result.current.openDrawer(horseId, "Буцефал");
        });
        await waitFor(() => expect(result.current.relationsLoading).toBe(false));

        let success = false;
        await act(async () => {
            success = await result.current.createRelation({ service_id: serviceId });
        });

        expect(success).toBe(true);
        expect(notificationMock.success).toHaveBeenCalledWith(expect.objectContaining({
            description: "Услуга привязана к лошади",
        }));
        expect(result.current.modalOpen).toBe(false);
    });

    it("returns false when create validation fails", async () => {
        const { result } = renderHook(() => useHorseServiceRelations());

        act(() => {
            result.current.openDrawer(horseId, "Буцефал");
        });
        await waitFor(() => expect(result.current.relationsLoading).toBe(false));

        let success = true;
        await act(async () => {
            success = await result.current.createRelation({ service_id: "" as UUID });
        });

        expect(success).toBe(false);
        expect(result.current.validationErrors.service_id).toBeDefined();
    });

    it("updates a relation and reloads list", async () => {
        const { result } = renderHook(() => useHorseServiceRelations());

        act(() => {
            result.current.openDrawer(horseId, "Буцефал");
        });
        await waitFor(() => expect(result.current.relationsLoading).toBe(false));

        let success = false;
        await act(async () => {
            success = await result.current.updateRelation(relationId, { description_override: "Новое описание" });
        });

        expect(success).toBe(true);
        expect(notificationMock.success).toHaveBeenCalledWith(expect.objectContaining({
            description: "Связь обновлена",
        }));
    });

    it("deletes a relation and reloads list", async () => {
        const { result } = renderHook(() => useHorseServiceRelations());

        act(() => {
            result.current.openDrawer(horseId, "Буцефал");
        });
        await waitFor(() => expect(result.current.relationsLoading).toBe(false));

        let success = false;
        await act(async () => {
            success = await result.current.deleteRelation(relationId);
        });

        expect(success).toBe(true);
        expect(notificationMock.success).toHaveBeenCalledWith(expect.objectContaining({
            description: "Услуга отвязана от лошади",
        }));
    });

    it("surfaces API error on create", async () => {
        server.use(
            http.post(apiUrl(`/horses/${horseId}/services`), () =>
                HttpResponse.json({ detail: "Forbidden" }, { status: 403 }),
            ),
        );

        const { result } = renderHook(() => useHorseServiceRelations());

        act(() => {
            result.current.openDrawer(horseId, "Буцефал");
        });
        await waitFor(() => expect(result.current.relationsLoading).toBe(false));

        let success = true;
        await act(async () => {
            success = await result.current.createRelation({ service_id: serviceId });
        });

        expect(success).toBe(false);
        expect(notificationMock.error).toHaveBeenCalledWith(expect.objectContaining({
            description: "Forbidden",
        }));
    });

    it("surfaces API error on update", async () => {
        server.use(
            http.patch(apiUrl(`/horses/${horseId}/services/${relationId}`), () =>
                HttpResponse.json({ detail: "Not found" }, { status: 404 }),
            ),
        );

        const { result } = renderHook(() => useHorseServiceRelations());

        act(() => {
            result.current.openDrawer(horseId, "Буцефал");
        });
        await waitFor(() => expect(result.current.relationsLoading).toBe(false));

        let success = true;
        await act(async () => {
            success = await result.current.updateRelation(relationId, {});
        });

        expect(success).toBe(false);
        expect(notificationMock.error).toHaveBeenCalledWith(expect.objectContaining({
            description: "Not found",
        }));
    });

    it("surfaces API error on delete", async () => {
        server.use(
            http.delete(apiUrl(`/horses/${horseId}/services/${relationId}`), () =>
                HttpResponse.json({ detail: "Cannot delete" }, { status: 400 }),
            ),
        );

        const { result } = renderHook(() => useHorseServiceRelations());

        act(() => {
            result.current.openDrawer(horseId, "Буцефал");
        });
        await waitFor(() => expect(result.current.relationsLoading).toBe(false));

        let success = true;
        await act(async () => {
            success = await result.current.deleteRelation(relationId);
        });

        expect(success).toBe(false);
        expect(notificationMock.error).toHaveBeenCalledWith(expect.objectContaining({
            description: "Cannot delete",
        }));
    });

    it("surfaces load error on openDrawer", async () => {
        server.use(
            http.get(apiUrl(`/horses/${horseId}/services`), () =>
                HttpResponse.json({ detail: "Server error" }, { status: 500 }),
            ),
        );

        const { result } = renderHook(() => useHorseServiceRelations());

        act(() => {
            result.current.openDrawer(horseId, "Буцефал");
        });
        await waitFor(() => expect(result.current.relationsLoading).toBe(false));

        expect(result.current.relations).toEqual([]);
        expect(notificationMock.error).toHaveBeenCalledWith(expect.objectContaining({
            description: "Не удалось загрузить услуги лошади",
        }));
    });

    it("clears state on closeDrawer", async () => {
        const { result } = renderHook(() => useHorseServiceRelations());

        act(() => {
            result.current.openDrawer(horseId, "Буцефал");
        });
        await waitFor(() => expect(result.current.relationsLoading).toBe(false));

        act(() => {
            result.current.closeDrawer();
        });

        expect(result.current.drawerOpen).toBe(false);
        expect(result.current.selectedHorseId).toBeNull();
        expect(result.current.selectedHorseName).toBe("");
        expect(result.current.relations).toEqual([]);
        expect(result.current.modalOpen).toBe(false);
    });

    it("guards double submit on create", async () => {
        let callCount = 0;
        server.use(
            http.post(apiUrl(`/horses/${horseId}/services`), async () => {
                callCount++;
                return HttpResponse.json(mockRelation);
            }),
        );

        const { result } = renderHook(() => useHorseServiceRelations());

        act(() => {
            result.current.openDrawer(horseId, "Буцефал");
        });
        await waitFor(() => expect(result.current.relationsLoading).toBe(false));

        await act(async () => {
            const first = result.current.createRelation({ service_id: serviceId });
            const second = result.current.createRelation({ service_id: serviceId });
            expect(await second).toBe(false);
            await first;
        });

        expect(callCount).toBe(1);
    });
});
