import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { usePricesPageActions } from "./usePricesPageActions";
import type { UUID } from "crypto";
import type { PriceOutDto } from "@/types/api/prices";
import type { PriceGroupOutDto } from "@/types/api/priceGroups";

const priceId = "00000000-0000-4000-8000-000000000001" as UUID;
const groupId = "00000000-0000-4000-8000-000000000002" as UUID;

const makePrice = (): PriceOutDto => ({
    id: priceId,
    name: "Тест",
    slug: "test",
    description: null,
    photos: [],
    groups: [],
    price_tables: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
});

const makeGroup = (): PriceGroupOutDto => ({
    id: groupId,
    name: "Группа 1",
    description: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
});

describe("usePricesPageActions", () => {
    const baseParams = {
        prices: [makePrice()],
        priceGroups: [makeGroup()],
        setSelectedPrice: vi.fn(),
        setSelectedGroupForReorder: vi.fn(),
        setPriceModalOpen: vi.fn(),
        setPricePhotosModalOpen: vi.fn(),
        setPricePageModalOpen: vi.fn(),
        setPriceGroupModalOpen: vi.fn(),
        setPriceGroupReorderModalOpen: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("handlePriceModalClose вызывает setPriceModalOpen(false)", () => {
        const setPriceModalOpen = vi.fn();
        const { result } = renderHook(() =>
            usePricesPageActions({ ...baseParams, setPriceModalOpen }),
        );
        act(() => {
            result.current.handlePriceModalClose();
        });
        expect(setPriceModalOpen).toHaveBeenCalledWith(false);
    });

    it("handlePriceTableModalClose отсутствует в возвращаемом объекте (regression guard)", () => {
        const { result } = renderHook(() => usePricesPageActions(baseParams));
        expect(result.current).not.toHaveProperty("handlePriceTableModalClose");
    });

    it("handleOpenPricePageModal устанавливает selectedPrice и открывает page modal", () => {
        const setSelectedPrice = vi.fn();
        const setPricePageModalOpen = vi.fn();
        const { result } = renderHook(() =>
            usePricesPageActions({ ...baseParams, setSelectedPrice, setPricePageModalOpen }),
        );
        act(() => {
            result.current.handleOpenPricePageModal(priceId);
        });
        expect(setSelectedPrice).toHaveBeenCalledWith(expect.objectContaining({ id: priceId }));
        expect(setPricePageModalOpen).toHaveBeenCalledWith(true);
    });

    it("handlePricePhotosModalClose вызывает setPricePhotosModalOpen(false)", () => {
        const setPricePhotosModalOpen = vi.fn();
        const { result } = renderHook(() =>
            usePricesPageActions({ ...baseParams, setPricePhotosModalOpen }),
        );
        act(() => {
            result.current.handlePricePhotosModalClose();
        });
        expect(setPricePhotosModalOpen).toHaveBeenCalledWith(false);
    });
});
