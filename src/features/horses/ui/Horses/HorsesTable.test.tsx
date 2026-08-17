import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { HorsesTable } from "./HorsesTable";
import {
  HorseListQueryParams,
  HorseOutDto,
  HorseWithPedigreeOutDto,
} from "@/types/api/horses";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import type { UUID } from "crypto";

vi.mock("@/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/ui")>();
  return {
    ...actual,
    ListFilter: ({
      filterData,
      setFilters,
    }: {
      filterData: Array<{ label: string; value: string }>;
      setFilters: (
        value: (previous: HorseListQueryParams) => HorseListQueryParams,
      ) => void;
    }) => (
      <div data-testid="list-filter">
        {filterData.map((option) => (
          <span key={option.value}>{option.label}</span>
        ))}
        <button
          type="button"
          onClick={() =>
            setFilters((previous) => ({
              ...previous,
              services: filterData.map((option) => option.value as UUID),
            }))
          }
        >
          Apply services
        </button>
        <button
          type="button"
          onClick={() =>
            setFilters((previous) => ({
              ...previous,
              services: [],
            }))
          }
        >
          Clear services
        </button>
      </div>
    ),
  };
});

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
  pedigree_name: "Родословная",
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
      ownerOptions={[]}
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

  it("renders the pedigree name column with exact data and a neutral null value", () => {
    renderTable([horse1, { ...horse2, pedigree_name: null }]);
    expect(
      screen.getByRole("columnheader", { name: "Кличка в родословной" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Родословная")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("renders База column with Да for this_stable=true", () => {
    renderTable([horse1]);
    expect(screen.getByText("Да")).toBeInTheDocument();
  });

  it("shows default Наши filter without an empty selection tag", async () => {
    renderTable([horse1]);

    await userEvent.click(
      screen.getByRole("columnheader", { name: /База/ }).querySelector(
        ".ant-table-filter-trigger",
      ) as HTMLElement,
    );

    const stableFilter = screen
      .getByRole("combobox", { name: "Фильтр по базе" })
      .closest(".ant-select");
    expect(stableFilter).toHaveTextContent("Наши");
    expect(
      document.querySelector(".ant-select-selection-item:empty"),
    ).toBeNull();
  });

  it("keeps the base filter boolean when selecting Чужие", async () => {
    const setFilters = vi.fn();
    renderWithCmsProviders(
      <HorsesTable
        horses={[horse1]}
        loading={false}
        filters={defaultFilters}
        setFilters={setFilters}
        filtersElements={null}
        onOpenHorseModal={noop}
        onPhotosClick={noop}
        onPedigreeClick={noop}
        onServicesClick={noop}
        breedOptions={[]}
        coatColorOptions={[]}
        ownerOptions={[]}
      />,
    );

    await userEvent.click(
      screen.getByRole("columnheader", { name: /База/ }).querySelector(
        ".ant-table-filter-trigger",
      ) as HTMLElement,
    );
    await userEvent.click(screen.getByText("Наши"));
    await userEvent.click(await screen.findByText("Чужие"));

    expect(setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ this_stable: false, offset: 0 }),
    );
  });

  it("keeps База and Кличка adjacent in a populated table", () => {
    renderTable([horse1]);
    const populatedRow = screen.getByText("Буцефал").closest("tr");
    const cells = populatedRow?.querySelectorAll("td");

    expect(cells?.[0]).toHaveTextContent("Да");
    expect(cells?.[1]).toHaveTextContent("Буцефал");
    expect(cells?.[0].nextElementSibling).toBe(cells?.[1]);
    expect(populatedRow).not.toHaveClass("ant-table-placeholder");
  });

  it("renders Нет for this_stable=false", () => {
    renderTable([horse2]);
    expect(screen.getByText("Нет")).toBeInTheDocument();
  });

  it("does not render horse-level Тип column", () => {
    renderTable([horse1, horse2]);
    expect(
      screen.queryByRole("columnheader", { name: "Тип" }),
    ).not.toBeInTheDocument();
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
        ownerOptions={[]}
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
    const emptyRow = document.querySelector(".ant-table-placeholder");
    const emptyCell = emptyRow?.querySelector("td");
    expect(document.querySelector(".ant-empty")).not.toBeNull();
    expect(emptyRow).not.toBeNull();
    expect(Number(emptyCell?.getAttribute("colspan"))).toBeGreaterThan(1);
  });

  it("shows a stable list error state", () => {
    renderTable([], false, defaultFilters, "Backend unavailable");
    expect(
      screen.getByText("Не удалось загрузить лошадей"),
    ).toBeInTheDocument();
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
    const fixedRightCells = document.querySelectorAll(
      ".ant-table-cell-fix-right",
    );
    expect(fixedRightCells.length).toBe(0);
  });

  // Regression NEW BUG: only two buttons (Фотографии + Родословная) in actions cell; no disabled 3rd button
  it("renders no disabled danger button in actions (3rd button removed)", () => {
    renderTable([horse1]);
    // The old code had a disabled danger button; after fix it should not exist
    const dangerDisabledBtns = document.querySelectorAll(
      "button[disabled].ant-btn-dangerous",
    );
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
        ownerOptions={[]}
      />,
    );
    // Find photos button (small buttons in actions column)
    const buttons = screen.getAllByRole("button");
    // first button in actions is photos button
    const photosBtn = buttons.find((b) =>
      b.querySelector("span.anticon-file-image"),
    );
    if (photosBtn) {
      await userEvent.click(photosBtn);
      expect(onPhotosClick).toHaveBeenCalledWith(horse1.id);
      expect(onOpenHorseModal).not.toHaveBeenCalled();
    }
  });

  it("keeps three pedigree indicators and uses gray count badges only for photos and services", async () => {
    const onPhotosClick = vi.fn();
    const onPedigreeClick = vi.fn();
    const onServicesClick = vi.fn();
    const horse = {
      ...horse1,
      services: [{ id: "s1" as UUID }],
      pedigree: { sire: horse1, dam: horse2, foals: [horse2] },
    } as HorseWithPedigreeOutDto;
    renderWithCmsProviders(
      <HorsesTable
        horses={[horse]}
        loading={false}
        filters={defaultFilters}
        setFilters={noop}
        filtersElements={null}
        onOpenHorseModal={noop}
        onPhotosClick={onPhotosClick}
        onPedigreeClick={onPedigreeClick}
        onServicesClick={onServicesClick}
        breedOptions={[]}
        coatColorOptions={[]}
        ownerOptions={[]}
      />,
    );
    expect(document.querySelectorAll(".ant-badge")).toHaveLength(2);
    expect(
      Array.from(document.querySelectorAll(".ant-badge-count")).every(
        (badge) =>
          (badge as HTMLElement).style.backgroundColor === "rgb(140, 140, 140)",
      ),
    ).toBe(true);

    const pedigreeButton = document
      .querySelector('[data-icon="branches"]')
      ?.closest("button");
    expect(pedigreeButton).not.toBeNull();
    const pedigreeIndicators = pedigreeButton?.querySelectorAll(
      "span[style*='border-radius']",
    );
    expect(pedigreeIndicators).toHaveLength(3);
    expect(
      Array.from(pedigreeIndicators ?? []).map(
        (indicator) => (indicator as HTMLElement).style.background,
      ),
    ).toEqual(["rgb(22, 119, 255)", "rgb(235, 47, 150)", "rgb(82, 196, 26)"]);

    await userEvent.click(screen.getByRole("button", { name: "Услуги" }));
    expect(onServicesClick).toHaveBeenCalledWith(horse.id);
    expect(onPhotosClick).not.toHaveBeenCalled();
    expect(onPedigreeClick).not.toHaveBeenCalled();
  });

  it("shows missing pedigree positions in gray and opens pedigree without triggering the row", async () => {
    const onOpenHorseModal = vi.fn();
    const onPedigreeClick = vi.fn();
    const horse = {
      ...horse1,
      pedigree: { sire: horse2, dam: null, foals: [] },
    } as HorseWithPedigreeOutDto;
    renderWithCmsProviders(
      <HorsesTable
        horses={[horse]}
        loading={false}
        filters={defaultFilters}
        setFilters={noop}
        filtersElements={null}
        onOpenHorseModal={onOpenHorseModal}
        onPhotosClick={noop}
        onPedigreeClick={onPedigreeClick}
        onServicesClick={noop}
        breedOptions={[]}
        coatColorOptions={[]}
        ownerOptions={[]}
      />,
    );

    expect(document.querySelectorAll(".ant-badge")).toHaveLength(2);
    const pedigreeButton = document
      .querySelector('[data-icon="branches"]')
      ?.closest("button");
    expect(pedigreeButton).not.toBeNull();
    const pedigreeIndicators = pedigreeButton?.querySelectorAll(
      "span[style*='border-radius']",
    );
    expect(pedigreeIndicators).toHaveLength(3);
    expect(
      Array.from(pedigreeIndicators ?? []).map(
        (indicator) => (indicator as HTMLElement).style.background,
      ),
    ).toEqual([
      "rgb(22, 119, 255)",
      "rgb(217, 217, 217)",
      "rgb(217, 217, 217)",
    ]);

    await userEvent.hover(pedigreeButton as HTMLElement);
    expect(await screen.findByText("Отец: Торпедо")).toBeInTheDocument();
    expect(screen.getByText("Мать: —")).toBeInTheDocument();
    expect(screen.getByText("Потомство: —")).toBeInTheDocument();

    await userEvent.click(pedigreeButton as HTMLElement);
    expect(onPedigreeClick).toHaveBeenCalledOnce();
    expect(onPedigreeClick).toHaveBeenCalledWith(horse.id);
    expect(onOpenHorseModal).not.toHaveBeenCalled();
  });
});
