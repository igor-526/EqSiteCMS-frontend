import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import type { HorseCoatColorOutDto } from "@/types/api/horseCoatColor";
import type { UUID } from "crypto";
import { HorseCoatColorsTable } from "./HorseCoatColorsTable";
import { KNOWN_USER_SCOPES } from "@/types/api/user";

const userContextState = vi.hoisted(() => ({ scopes: ["ADMIN"] as KNOWN_USER_SCOPES[] }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => ({ scopes: userContextState.scopes }) }));

type TestRow = Record<string, unknown> & { key: string };
type TestColumn = { key: string; title: React.ReactNode; dataIndex?: string; filterDropdown?: React.ReactNode };
type MainTableMockProps = {
    сolumns: TestColumn[];
    data: TestRow[];
    loading: boolean;
    onSortChange: (sort: string[]) => void;
    onRow: (row: TestRow) => { onClick: () => void };
};
type StringFilterMockProps = { onChange: (value: string) => void; placeHolder: string };

vi.mock("@/ui", () => ({
    MainTable: ({ сolumns, data, loading, onSortChange, onRow }: MainTableMockProps) => <div data-testid="table" data-loading={loading}>
        {сolumns.map((column) => <div key={column.key}><span>{column.title}</span>{column.filterDropdown}</div>)}
        {data.map((row) => <button key={row.key} onClick={onRow(row).onClick}>
            {сolumns.map((column) => <span key={column.key}>{column.dataIndex ? String(row[column.dataIndex] ?? "") : null}</span>)}
        </button>)}
        <button onClick={() => onSortChange(["short_name"])}>asc</button>
        <button onClick={() => onSortChange(["-short_name"])}>desc</button>
        <button onClick={() => onSortChange([])}>clear</button>
    </div>,
    StringFilter: ({ onChange, placeHolder }: StringFilterMockProps) => <>
        <button onClick={() => onChange("гн")}>{placeHolder}</button>
        <button onClick={() => onChange("")}>clear search</button>
    </>,
}));

const coat: HorseCoatColorOutDto = { id: "00000000-0000-4000-8000-000000000201" as UUID,
    name: "Гнедая", short_name: "Гн.", slug: "bay", description: null,
    created_at: "2026-01-01T00:00:00Z", updated_at: null };

describe("HorseCoatColorsTable", () => {
    it("renders data, loading/empty states and row action", async () => {
        const onOpen = vi.fn();
        const { rerender } = renderWithCmsProviders(<HorseCoatColorsTable horseCoatColors={[coat]} loading
            filters={{ limit: 25, offset: 0, sort: [] }} setFilters={vi.fn()} filtersElements={null}
            onOpenHorseCoatColorModal={onOpen} onOpenHorseCoatColorPhotosModal={vi.fn()}
            onOpenHorseCoatColorPageModal={vi.fn()} />);
        expect(screen.getByText("Кор. наим.")).toBeInTheDocument();
        expect(screen.getByText("Гн.")).toBeInTheDocument();
        expect(screen.getByTestId("table")).toHaveAttribute("data-loading", "true");
        await userEvent.click(screen.getByRole("button", { name: /Гнедая/ }));
        expect(onOpen).toHaveBeenCalledWith(coat.id);
        rerender(<HorseCoatColorsTable horseCoatColors={[]} loading={false}
            filters={{ limit: 25, offset: 0, sort: [] }} setFilters={vi.fn()} filtersElements={null}
            onOpenHorseCoatColorModal={onOpen} onOpenHorseCoatColorPhotosModal={vi.fn()}
            onOpenHorseCoatColorPageModal={vi.fn()} />);
        expect(screen.queryByText("Гн.")).not.toBeInTheDocument();
    });

    it("applies/clears search and asc/desc/clear sort with offset reset", async () => {
        const setFilters = vi.fn();
        renderWithCmsProviders(<HorseCoatColorsTable horseCoatColors={[coat]} loading={false}
            filters={{ limit: 25, offset: 50, sort: [] }} setFilters={setFilters} filtersElements={null}
            onOpenHorseCoatColorModal={vi.fn()} onOpenHorseCoatColorPhotosModal={vi.fn()}
            onOpenHorseCoatColorPageModal={vi.fn()} />);
        await userEvent.click(screen.getByRole("button", { name: "Поиск по короткому наименованию" }));
        expect(setFilters).toHaveBeenCalledWith(expect.objectContaining({ short_name: "гн", offset: 0 }));
        await userEvent.click(screen.getAllByRole("button", { name: "clear search" })[1]);
        expect(setFilters).toHaveBeenCalledWith(expect.objectContaining({ short_name: undefined, offset: 0 }));
        for (const name of ["asc", "desc", "clear"]) await userEvent.click(screen.getByRole("button", { name }));
        expect(setFilters).toHaveBeenCalledWith(expect.objectContaining({ sort: ["short_name"], offset: 0 }));
        expect(setFilters).toHaveBeenCalledWith(expect.objectContaining({ sort: ["-short_name"], offset: 0 }));
        expect(setFilters).toHaveBeenCalledWith(expect.objectContaining({ sort: [], offset: 0 }));
    });

    it("guards edit row click without dictionary scope", async () => {
        userContextState.scopes = [];
        const onOpen = vi.fn();
        renderWithCmsProviders(<HorseCoatColorsTable horseCoatColors={[coat]} loading={false}
            filters={{ limit: 25, offset: 0, sort: [] }} setFilters={vi.fn()} filtersElements={null}
            onOpenHorseCoatColorModal={onOpen} onOpenHorseCoatColorPhotosModal={vi.fn()}
            onOpenHorseCoatColorPageModal={vi.fn()} />);
        await userEvent.click(screen.getByRole("button", { name: /Гнедая/ }));
        expect(onOpen).not.toHaveBeenCalled();
    });
});
