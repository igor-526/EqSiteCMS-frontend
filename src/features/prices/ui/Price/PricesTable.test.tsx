import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { PricesTable } from "./PricesTable";
import type { UUID } from "crypto";
import type { PriceOutDto } from "@/types/api/prices";
import type { PriceListQueryParams } from "@/types/api/prices";

const priceId = "00000000-0000-4000-8000-000000000001" as UUID;
const groupId = "00000000-0000-4000-8000-000000000010" as UUID;

const price1: PriceOutDto = {
    id: priceId,
    name: "Стрижка гривы",
    slug: "strizhka-grivy",
    description: "Описание услуги",
    photos: [],
    groups: [{ id: groupId, name: "Уход" }],
    price_tables: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
};

const defaultFilters: PriceListQueryParams = { limit: 25, offset: 0 };
const noop = vi.fn();

const renderTable = (overrides: Partial<React.ComponentProps<typeof PricesTable>> = {}) =>
    renderWithCmsProviders(
        <PricesTable
            prices={[price1]}
            loading={false}
            filters={defaultFilters}
            setFilters={noop}
            filtersElements={null}
            onOpenPriceModal={noop}
            priceGroupsOptions={[{ key: "g1", label: "Уход", value: groupId }]}
            onDuplicatePrice={noop}
            onOpenPricePhotosModal={noop}
            onOpenPricePageModal={noop}
            {...overrides}
        />,
    );

describe("PricesTable", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders price name", () => {
        renderTable();
        expect(screen.getByText("Стрижка гривы")).toBeInTheDocument();
    });

    it("actions column has CopyOutlined button, no TableOutlined button", () => {
        const { container } = renderTable();
        expect(container.querySelector(".anticon-copy")).not.toBeNull();
        expect(container.querySelector(".anticon-table")).toBeNull();
    });

    it("clicking CopyOutlined calls onDuplicatePrice with price id", async () => {
        const onDuplicatePrice = vi.fn();
        const { container } = renderTable({ onDuplicatePrice });
        const copyBtn = container.querySelector(".anticon-copy")?.closest("button");
        expect(copyBtn).not.toBeNull();
        await userEvent.click(copyBtn!);
        expect(onDuplicatePrice).toHaveBeenCalledWith(priceId);
    });

    it("clicking CopyOutlined does not open price modal (stopPropagation)", async () => {
        const onOpenPriceModal = vi.fn();
        const onDuplicatePrice = vi.fn();
        const { container } = renderTable({ onOpenPriceModal, onDuplicatePrice });
        const copyBtn = container.querySelector(".anticon-copy")?.closest("button");
        await userEvent.click(copyBtn!);
        expect(onOpenPriceModal).not.toHaveBeenCalled();
    });

    it("clicking row calls onOpenPriceModal with price id (regression)", async () => {
        const onOpenPriceModal = vi.fn();
        renderTable({ onOpenPriceModal });
        const row = screen.getByText("Стрижка гривы").closest("tr");
        expect(row).not.toBeNull();
        await userEvent.click(row!);
        expect(onOpenPriceModal).toHaveBeenCalledWith(priceId);
    });

    it("shows loading spinner when loading=true", () => {
        const { container } = renderTable({ prices: [], loading: true });
        expect(container.querySelector(".ant-spin")).not.toBeNull();
    });

    it("shows empty state when prices=[]", () => {
        const { container } = renderTable({ prices: [] });
        expect(container.querySelector(".ant-empty")).not.toBeNull();
    });
});
