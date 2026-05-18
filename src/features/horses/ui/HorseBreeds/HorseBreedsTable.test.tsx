import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { HorseBreedsTable } from "./HorseBreedsTable";
import type { HorseBreedListQueryParams, HorseBreedOutDto } from "@/types/api/horseBreeds";
import type { UUID } from "crypto";

vi.mock("@/ui", () => ({
    MainTable: ({
        сolumns,
        data,
        loading,
        onSortChange,
    }: {
        сolumns: Array<{
            key?: string;
            title?: React.ReactNode;
            dataIndex?: string;
            render?: (value: unknown, record: Record<string, unknown>) => React.ReactNode;
            filterDropdown?: React.ReactNode;
        }>;
        data: Record<string, unknown>[];
        loading: boolean;
        onSortChange?: (sort: string[]) => void;
    }) => (
        <div data-loading={loading}>
            {сolumns.map((column) => (
                <div key={String(column.key)}>
                    <span>{column.title}</span>
                    {column.key === "kind" ? column.filterDropdown : null}
                </div>
            ))}
            {data.map((row) => (
                <div key={String(row.key)}>
                    {сolumns.map((column) => (
                        <span key={String(column.key)}>
                            {column.render
                                ? column.render(
                                    column.dataIndex ? row[column.dataIndex] : row,
                                    row,
                                )
                                : String(column.dataIndex ? row[column.dataIndex] : "")}
                        </span>
                    ))}
                </div>
            ))}
            <button type="button" onClick={() => onSortChange?.(["kind"])}>
                sort kind
            </button>
            <button type="button" onClick={() => onSortChange?.(["-kind"])}>
                sort kind desc
            </button>
        </div>
    ),
    StringFilter: () => <div />,
    ListFilter: ({
        filterKey,
        setFilters,
        placeHolder,
    }: {
        filterKey: string;
        setFilters: (value: (prev: HorseBreedListQueryParams) => HorseBreedListQueryParams) => void;
        placeHolder: string;
    }) => (
        <button
            type="button"
            onClick={() =>
                setFilters((prev) => ({
                    ...prev,
                    [filterKey]: ["pony"],
                }))
            }
        >
            {placeHolder}
        </button>
    ),
}));

const breedHorse: HorseBreedOutDto = {
    id: "00000000-0000-4000-8000-000000000101" as UUID,
    name: "Арабская",
    slug: "arabian",
    description: null,
    kind: "horse",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
};

const breedPony: HorseBreedOutDto = {
    ...breedHorse,
    id: "00000000-0000-4000-8000-000000000102" as UUID,
    name: "Уэльская",
    slug: "welsh",
    kind: "pony",
};

const filters: HorseBreedListQueryParams = {
    limit: 25,
    offset: 0,
    sort: [],
};

describe("HorseBreedsTable", () => {
    it("renders type column labels", () => {
        renderWithCmsProviders(
            <HorseBreedsTable
                horseBreeds={[breedHorse, breedPony]}
                loading={false}
                filters={filters}
                setFilters={vi.fn()}
                filtersElements={null}
                onOpenHorseBreedModal={vi.fn()}
                onOpenHorseBreedPhotosModal={vi.fn()}
                onOpenHorseBreedPageModal={vi.fn()}
            />,
        );

        expect(screen.getAllByText("Тип").length).toBeGreaterThan(0);
        expect(screen.getByText("Лошадь")).toBeInTheDocument();
        expect(screen.getByText("Пони")).toBeInTheDocument();
    });

    it("applies inline type filter and resets offset", async () => {
        const setFilters = vi.fn();
        renderWithCmsProviders(
            <HorseBreedsTable
                horseBreeds={[breedHorse]}
                loading={false}
                filters={{ ...filters, offset: 50 }}
                setFilters={setFilters}
                filtersElements={null}
                onOpenHorseBreedModal={vi.fn()}
                onOpenHorseBreedPhotosModal={vi.fn()}
                onOpenHorseBreedPageModal={vi.fn()}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Тип" }));

        expect(setFilters).toHaveBeenCalledWith(expect.objectContaining({
            kind: ["pony"],
            offset: 0,
        }));
    });

    it("maps kind sort values and resets offset", async () => {
        const setFilters = vi.fn();
        renderWithCmsProviders(
            <HorseBreedsTable
                horseBreeds={[breedHorse]}
                loading={false}
                filters={{ ...filters, offset: 25 }}
                setFilters={setFilters}
                filtersElements={null}
                onOpenHorseBreedModal={vi.fn()}
                onOpenHorseBreedPhotosModal={vi.fn()}
                onOpenHorseBreedPageModal={vi.fn()}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "sort kind desc" }));

        expect(setFilters).toHaveBeenCalledWith(expect.objectContaining({
            sort: ["-kind"],
            offset: 0,
        }));
    });
});
