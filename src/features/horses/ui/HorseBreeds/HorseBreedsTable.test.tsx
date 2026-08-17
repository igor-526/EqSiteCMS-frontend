import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import { HorseBreedsTable } from "./HorseBreedsTable";
import type {
  HorseBreedListQueryParams,
  HorseBreedOutDto,
} from "@/types/api/horseBreeds";
import type { UUID } from "crypto";
import { KNOWN_USER_SCOPES } from "@/types/api/user";

const userContextState = vi.hoisted(() => ({
  scopes: ["ADMIN"] as KNOWN_USER_SCOPES[],
}));
vi.mock("@/contexts/UserContext", () => ({
  useUserContext: () => ({ scopes: userContextState.scopes }),
}));

vi.mock("@/ui", () => ({
  MainTable: ({
    сolumns,
    data,
    loading,
    onSortChange,
    onRow,
  }: {
    сolumns: Array<{
      key?: string;
      title?: React.ReactNode;
      dataIndex?: string;
      render?: (
        value: unknown,
        record: Record<string, unknown>,
      ) => React.ReactNode;
      filterDropdown?: React.ReactNode;
    }>;
    data: Record<string, unknown>[];
    loading: boolean;
    onSortChange?: (sort: string[]) => void;
    onRow: (row: Record<string, unknown>) => { onClick: () => void };
  }) => (
    <div data-loading={loading}>
      {сolumns.map((column) => (
        <div key={String(column.key)}>
          <span>{column.title}</span>
          {column.key === "kind" || column.key === "short_name" || column.key === "group_name"
            ? column.filterDropdown
            : null}
        </div>
      ))}
      {data.map((row) => (
        <button
          type="button"
          key={String(row.key)}
          onClick={onRow(row).onClick}
        >
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
        </button>
      ))}
      <button type="button" onClick={() => onSortChange?.(["kind"])}>
        sort kind
      </button>
      <button type="button" onClick={() => onSortChange?.(["-kind"])}>
        sort kind desc
      </button>
      <button type="button" onClick={() => onSortChange?.(["short_name"])}>
        sort short name
      </button>
      <button type="button" onClick={() => onSortChange?.(["-group_name"])}>
        sort group desc
      </button>
      <button type="button" onClick={() => onSortChange?.([])}>
        clear sort
      </button>
    </div>
  ),
  StringFilter: ({
    onChange,
    placeHolder,
  }: {
    onChange: (value: string) => void;
    placeHolder: string;
  }) => (
    <button type="button" onClick={() => onChange("ар")}>
      {placeHolder}
    </button>
  ),
  ListFilter: ({
    filterKey,
    setFilters,
    placeHolder,
  }: {
    filterKey: string;
    setFilters: (
      value: (prev: HorseBreedListQueryParams) => HorseBreedListQueryParams,
    ) => void;
    placeHolder: string;
  }) => (
    <button
      type="button"
      onClick={() =>
        setFilters((prev) => ({
          ...prev,
          [filterKey]: [filterKey === "breed_group_ids" ? "00000000-0000-4000-8000-000000000201" : "pony"],
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
  short_name: "Араб.",
  slug: "arabian",
  description: null,
  kind: "horse",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
  group: null,
};

const breedPony: HorseBreedOutDto = {
  ...breedHorse,
  id: "00000000-0000-4000-8000-000000000102" as UUID,
  name: "Уэльская",
  short_name: "Уэл.",
  slug: "welsh",
  kind: "pony",
};

const group = {
  id: "00000000-0000-4000-8000-000000000201" as UUID,
  name: "Верховые",
  slug: "riding",
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

        onOpenHorseBreedPageModal={vi.fn()}
      />,
    );

    expect(screen.getAllByText("Тип").length).toBeGreaterThan(0);
    expect(screen.getByText("Лошадь")).toBeInTheDocument();
    expect(screen.getByText("Пони")).toBeInTheDocument();
  });

  it("keeps the breed after group deletion, renders dash, and preserves the exact seven-column order", () => {
    renderWithCmsProviders(<HorseBreedsTable horseBreeds={[{ ...breedHorse, group }, breedPony]}
      loading={false} filters={filters} setFilters={vi.fn()} filtersElements={null}
      onOpenHorseBreedModal={vi.fn()} onOpenHorseBreedPageModal={vi.fn()}
      groupOptions={[{ label: group.name, value: group.id }]} />);
    const titles = ["Тип", "Группа", "Наименование", "Кор. наим.", "Описание", "Путь URL", "Действия"];
    const nodes = titles.map((title) => screen.getAllByText(title)[0]);
    nodes.slice(1).forEach((node, index) => expect(nodes[index].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy());
    expect(screen.getByText("Верховые")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("Арабская")).toBeInTheDocument();
    expect(screen.getByText("Уэльская")).toBeInTheDocument();
  });

  it("applies group multi-filter and group sort", async () => {
    const setFilters = vi.fn();
    renderWithCmsProviders(<HorseBreedsTable horseBreeds={[breedHorse]} loading={false}
      filters={{ ...filters, offset: 50 }} setFilters={setFilters} filtersElements={null}
      onOpenHorseBreedModal={vi.fn()} onOpenHorseBreedPageModal={vi.fn()}
      groupOptions={[{ label: group.name, value: group.id }]} />);
    await userEvent.click(screen.getByRole("button", { name: "Группы" }));
    expect(setFilters).toHaveBeenCalledWith(expect.objectContaining({ breed_group_ids: [group.id], offset: 0 }));
    await userEvent.click(screen.getByRole("button", { name: "sort group desc" }));
    expect(setFilters).toHaveBeenCalledWith(expect.objectContaining({ sort: ["-group_name"], offset: 0 }));
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

        onOpenHorseBreedPageModal={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Тип" }));

    expect(setFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: ["pony"],
        offset: 0,
      }),
    );
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

        onOpenHorseBreedPageModal={vi.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "sort kind desc" }),
    );

    expect(setFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: ["-kind"],
        offset: 0,
      }),
    );
  });

  it("renders, filters and sorts the short-name column with offset reset", async () => {
    const setFilters = vi.fn();
    renderWithCmsProviders(
      <HorseBreedsTable
        horseBreeds={[breedHorse]}
        loading={false}
        filters={{ ...filters, offset: 50 }}
        setFilters={setFilters}
        filtersElements={null}
        onOpenHorseBreedModal={vi.fn()}
        onOpenHorseBreedPageModal={vi.fn()}
      />,
    );
    expect(screen.getByText("Кор. наим.")).toBeInTheDocument();
    expect(screen.getByText("Араб.")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Поиск по короткому наименованию" }),
    );
    expect(setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ short_name: "ар", offset: 0 }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "sort short name" }),
    );
    expect(setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ sort: ["short_name"], offset: 0 }),
    );
    await userEvent.click(screen.getByRole("button", { name: "clear sort" }));
    expect(setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ sort: [], offset: 0 }),
    );
  });

  it("opens edit with dictionary scope and guards row click without it", async () => {
    const onOpen = vi.fn();
    userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];
    const { unmount } = renderWithCmsProviders(
      <HorseBreedsTable
        horseBreeds={[breedHorse]}
        loading={false}
        filters={filters}
        setFilters={vi.fn()}
        filtersElements={null}
        onOpenHorseBreedModal={onOpen}
        onOpenHorseBreedPageModal={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Арабская/ }));
    expect(onOpen).toHaveBeenCalledWith(breedHorse.id);
    unmount();

    userContextState.scopes = [];
    renderWithCmsProviders(
      <HorseBreedsTable
        horseBreeds={[breedHorse]}
        loading={false}
        filters={filters}
        setFilters={vi.fn()}
        filtersElements={null}
        onOpenHorseBreedModal={onOpen}
        onOpenHorseBreedPageModal={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Арабская/ }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
