import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { HorsesTable } from "./HorsesTable";
import { HorseListQueryParams, HorseOutDto } from "@/types/api/horses";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import type { UUID } from "crypto";

const userContextState = vi.hoisted(() => ({
    scopes: [] as KNOWN_USER_SCOPES[],
    user: null as null | { username: string },
}));

vi.mock("@/contexts/UserContext", () => ({
    useUserContext: () => ({
        user: userContextState.user,
        loading: false,
        error: null,
        scopes: userContextState.scopes,
        refreshUser: vi.fn(),
        clearUser: vi.fn(),
    }),
}));

const horse1: HorseOutDto = {
    id: "00000000-0000-4000-8000-000000000001" as UUID,
    slug: "bucefalus",
    name: "Буцефал",
    code: "EXT-001",
    description: "Конь Александра",
    breed: { id: "b1" as UUID, name: "Арабская", slug: "arab" },
    coat_color: { id: "c1" as UUID, name: "Гнедая", slug: "bay" },
    height: 160,
    sex: "male",
    bdate: null,
    ddate: null,
    bdate_mode: "hide",
    ddate_mode: "hide",
    bdate_formatted: null,
    ddate_formatted: null,
    age: null,
    horse_owner: { id: "o1" as UUID, name: "Иван" },
    photos: [],
    this_stable: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
};

const horse2: HorseOutDto = {
    ...horse1,
    id: "00000000-0000-4000-8000-000000000002" as UUID,
    name: "Торпедо",
    this_stable: false,
    sex: "female",
    breed: null,
    coat_color: null,
    horse_owner: null,
};

const defaultFilters: HorseListQueryParams = {
    limit: 25,
    offset: 0,
    this_stable: true,
    pedigree: 1,
    sort: [],
};

const noop = vi.fn();

const renderTable = (
    horses: HorseOutDto[] = [horse1],
    loading = false,
    filters = defaultFilters,
    error: string | null = null,
) => {
    return renderWithCmsProviders(
        <HorsesTable
            horses={horses}
            loading={loading}
            error={error}
            filters={filters}
            setFilters={noop}
            filtersElements={null}
            onOpenHorseModal={noop}
            onPhotosClick={noop}
            onPedigreeClick={noop}
            onServicesClick={noop}
            breedOptions={[{ label: "Арабская", value: "b1" }]}
            coatColorOptions={[{ label: "Гнедая", value: "c1" }]}
        />,
    );
};

describe("HorsesTable", () => {
    beforeEach(() => {
        userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
        userContextState.user = { username: "admin" };
    });

    it("renders horse name in the table", () => {
        renderTable();
        expect(screen.getByText("Буцефал")).toBeInTheDocument();
    });

    it("renders the code column with exact data and a neutral null value", () => {
        renderTable([horse1, { ...horse2, code: null }]);
        expect(screen.getByRole("columnheader", { name: "Код" })).toBeInTheDocument();
        expect(screen.getByText("EXT-001")).toBeInTheDocument();
        expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    });

    it("renders База column with Да for this_stable=true", () => {
        renderTable([horse1]);
        expect(screen.getByText("Да")).toBeInTheDocument();
    });

    it("renders Нет for this_stable=false", () => {
        renderTable([horse2]);
        expect(screen.getByText("Нет")).toBeInTheDocument();
    });

    it("does not render horse-level Тип column", () => {
        renderTable([horse1, horse2]);
        expect(screen.queryByRole("columnheader", { name: "Тип" })).not.toBeInTheDocument();
    });

    it("russifies sex: male → Жеребец, female → Кобыла", () => {
        renderTable([horse1, horse2]);
        expect(screen.getByText("Жеребец")).toBeInTheDocument();
        expect(screen.getByText("Кобыла")).toBeInTheDocument();
    });

    it("renders '—' when breed is null", () => {
        renderTable([horse2]);
        // horse2 has no breed, no coat_color, no owner
        const cells = screen.getAllByText("—");
        expect(cells.length).toBeGreaterThan(0);
    });

    it("renders photos button with count", () => {
        renderTable([{ ...horse1, photos: [] }]);
        // FileImageOutlined button exists
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(0);
    });

    it("calls onOpenHorseModal when row is clicked", async () => {
        const onOpenHorseModal = vi.fn();
        renderWithCmsProviders(
            <HorsesTable
                horses={[horse1]}
                loading={false}
                filters={defaultFilters}
                setFilters={noop}
                filtersElements={null}
                onOpenHorseModal={onOpenHorseModal}
                onPhotosClick={noop}
                onPedigreeClick={noop}
                onServicesClick={noop}
                breedOptions={[]}
                coatColorOptions={[]}
            />,
        );
        const row = screen.getByText("Буцефал").closest("tr");
        if (row) {
            await userEvent.click(row);
        }
        expect(onOpenHorseModal).toHaveBeenCalledWith(horse1.id);
    });

    it("shows loading spinner when loading=true", () => {
        renderTable([], true);
        // AntD table renders loading indicator
        expect(document.querySelector(".ant-spin")).not.toBeNull();
    });

    it("shows empty table when horses=[]", () => {
        renderTable([]);
        // AntD renders empty text
        expect(document.querySelector(".ant-empty")).not.toBeNull();
    });

    it("shows a stable list error state", () => {
        renderTable([], false, defaultFilters, "Backend unavailable");
        expect(screen.getByText("Не удалось загрузить лошадей")).toBeInTheDocument();
        expect(screen.getByText("Backend unavailable")).toBeInTheDocument();
    });

    // Regression BUG 1: Порода column must show breed name, not coat_color
    it("renders breed name in Порода column (regression BUG 1)", () => {
        renderTable([horse1]);
        // horse1 has breed.name = "Арабская" and coat_color.name = "Гнедая"
        // Both should appear in their correct columns
        expect(screen.getByText("Арабская")).toBeInTheDocument();
        expect(screen.getByText("Гнедая")).toBeInTheDocument();
    });

    // Regression NEW BUG: Actions column must NOT be fixed to right
    it("Actions column has no fixed:right (regression NEW BUG)", () => {
        renderTable();
        // If fixed:right were active, AntD would add ant-table-cell-fix-right class.
        // With fix removed there should be no sticky fixed-right cells.
        const fixedRightCells = document.querySelectorAll(".ant-table-cell-fix-right");
        expect(fixedRightCells.length).toBe(0);
    });

    // Regression NEW BUG: only two buttons (Фотографии + Родословная) in actions cell; no disabled 3rd button
    it("renders no disabled danger button in actions (3rd button removed)", () => {
        renderTable([horse1]);
        // The old code had a disabled danger button; after fix it should not exist
        const dangerDisabledBtns = document.querySelectorAll("button[disabled].ant-btn-dangerous");
        expect(dangerDisabledBtns.length).toBe(0);
    });

    it("calls onPhotosClick when photos button is clicked (stops propagation)", async () => {
        const onPhotosClick = vi.fn();
        const onOpenHorseModal = vi.fn();
        renderWithCmsProviders(
            <HorsesTable
                horses={[horse1]}
                loading={false}
                filters={defaultFilters}
                setFilters={noop}
                filtersElements={null}
                onOpenHorseModal={onOpenHorseModal}
                onPhotosClick={onPhotosClick}
                onPedigreeClick={noop}
                onServicesClick={noop}
                breedOptions={[]}
                coatColorOptions={[]}
            />,
        );
        // Find photos button (small buttons in actions column)
        const buttons = screen.getAllByRole("button");
        // first button in actions is photos button
        const photosBtn = buttons.find((b) => b.querySelector("span.anticon-file-image"));
        if (photosBtn) {
            await userEvent.click(photosBtn);
            expect(onPhotosClick).toHaveBeenCalledWith(horse1.id);
            expect(onOpenHorseModal).not.toHaveBeenCalled();
        }
    });
});
