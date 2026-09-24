import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  SiteSettingsTable,
  type SiteSettingsTableProps,
} from "./SiteSettingsTable";
import {
  SiteSettingListQueryParams,
  SiteSettingOutDto,
  SiteSettingType,
} from "@/types/api/siteSettings";
import type { UUID } from "crypto";

type ColumnLike = {
  key?: string;
  title?: React.ReactNode;
  dataIndex?: string;
  render?: (value: unknown, record: Record<string, unknown>) => React.ReactNode;
  filterDropdown?: React.ReactNode;
};

vi.mock("@/ui", () => ({
  MainTable: ({
    сolumns,
    data,
    loading,
    onRow,
  }: {
    сolumns: ColumnLike[];
    data: Record<string, unknown>[];
    loading: boolean;
    onRow?: (row: Record<string, unknown>) => { onClick: () => void };
  }) => (
    <div data-testid="main-table" data-loading={String(loading)}>
      {сolumns.map((column) => (
        <div key={String(column.key)}>
          <span>{column.title}</span>
          {column.filterDropdown ?? null}
        </div>
      ))}
      {data.map((row) => (
        <button type="button" key={String(row.key)} onClick={onRow?.(row).onClick}>
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
    </div>
  ),
  StringFilter: ({
    onChange,
    placeHolder,
  }: {
    onChange: (value: string) => void;
    placeHolder: string;
  }) => (
    <button type="button" onClick={() => onChange("site.")}>
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
      value: (
        prev: SiteSettingListQueryParams,
      ) => SiteSettingListQueryParams,
    ) => void;
    placeHolder: string;
  }) => (
    <button
      type="button"
      onClick={() =>
        setFilters((prev) => ({ ...prev, [filterKey]: [SiteSettingType.number] }))
      }
    >
      {placeHolder}
    </button>
  ),
}));

vi.mock("./SiteSettingsHeader", () => ({
  SiteSettingsHeader: () => <div>header</div>,
}));

const siteSetting: SiteSettingOutDto = {
  id: "00000000-0000-4000-8000-000000000301" as UUID,
  key: "site.title",
  name: "Заголовок",
  type: SiteSettingType.string,
  value: "Иннолово",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: null,
};

const filters: SiteSettingListQueryParams = {
  limit: 25,
  offset: 50,
  sort: [],
};

const buildProps = (
  overrides: Partial<SiteSettingsTableProps> = {},
): SiteSettingsTableProps => ({
  activeTab: "settings",
  setActiveTab: vi.fn(),
  siteSettings: [siteSetting],
  siteSettingsTotal: 1,
  loading: false,
  filters,
  setFilters: vi.fn(),
  onOpenSiteSettingModal: vi.fn(),
  onResetSiteSettingFilters: vi.fn(),
  ...overrides,
});

describe("SiteSettingsTable", () => {
  it("renders data columns without a description column or filter", () => {
    render(<SiteSettingsTable {...buildProps()} />);

    expect(screen.getByText("Key")).toBeInTheDocument();
    expect(screen.getByText("Наименование")).toBeInTheDocument();
    expect(screen.getByText("Тип")).toBeInTheDocument();
    expect(screen.getByText("Значение")).toBeInTheDocument();
    expect(screen.getByText("site.title")).toBeInTheDocument();
    expect(screen.getByText("Иннолово")).toBeInTheDocument();

    expect(screen.queryByText("Описание")).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Поиск по описанию"),
    ).not.toBeInTheDocument();
  });

  it("passes the loading state through and renders no rows when empty", () => {
    const { rerender } = render(
      <SiteSettingsTable {...buildProps({ loading: true })} />,
    );
    expect(screen.getByTestId("main-table")).toHaveAttribute(
      "data-loading",
      "true",
    );

    rerender(<SiteSettingsTable {...buildProps({ siteSettings: [] })} />);
    expect(screen.queryByRole("button", { name: /site.title/ })).not.toBeInTheDocument();
  });

  it("applies the key filter", () => {
    const setFilters = vi.fn();
    render(<SiteSettingsTable {...buildProps({ setFilters })} />);

    fireEvent.click(screen.getByText("Поиск по ключу"));

    expect(setFilters).toHaveBeenCalledWith({ ...filters, key: "site." });
  });

  it("applies the type multi-filter", () => {
    const setFilters = vi.fn();
    render(<SiteSettingsTable {...buildProps({ setFilters })} />);

    fireEvent.click(screen.getByText("Поиск по типу"));

    expect(setFilters).toHaveBeenCalledWith({
      ...filters,
      type: [SiteSettingType.number],
    });
  });

  it("calls onOpenSiteSettingModal with the row id on row click", () => {
    const onOpenSiteSettingModal = vi.fn();
    render(
      <SiteSettingsTable {...buildProps({ onOpenSiteSettingModal })} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /site.title/ }));

    expect(onOpenSiteSettingModal).toHaveBeenCalledWith(siteSetting.id.toString());
  });
});
