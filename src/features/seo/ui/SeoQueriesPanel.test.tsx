import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import type { MetricsTableOutDto } from "@/types/api/metricsTable";
import type { useSeoQueriesTable } from "../hooks/useSeoQueriesTable";
import { SeoQueriesPanel } from "./SeoQueriesPanel";

function model(): ReturnType<typeof useSeoQueriesTable> {
  const metricsTable: MetricsTableOutDto = {
    version: 1, row_key: "id", ordering: null,
    metric: { key: "visits", title: "Визиты", value_type: "integer" },
    period: { mode: "day", date_from: "2026-10-01", date_to: "2026-10-26", today: "2026-10-26", defaulted: true, adjusted: false, clamped: false, requested_date_from: null, requested_date_to: null },
    columns: [
      { key: "metric:2026-10-20", title: "20 окт", hint: "Серверная подсказка", align: "right", sortable: true, value_type: "future", empty_text: "—", values: { q1: { value: 115, text: "1 мин 55 с" }, q2: { value: 0, text: "0" } } },
      { key: "metric:2026-10-21", title: "21 окт", hint: null, align: "left", sortable: false, value_type: "future", empty_text: "нет значения", values: {} },
    ],
  };
  return {
    resource: "queries", allowed: true,
    filters: { limit: 25, offset: 0, mode: "day", metric: "visits", dateFrom: "2026-10-01", dateTo: "2026-10-26" },
    items: ["q1", "q2", "q3"].map(id => ({ id, query: `${id} ${"длинный запрос ".repeat(30)}`, created_at: "2026-10-23T14:05:00Z" })),
    total: 101, metricsTable, loading: false, error: null, today: "2026-10-26", sort: [], searchDraft: "",
    setFilters: vi.fn(), changeSort: vi.fn(), changeSearch: vi.fn(), changeMode: vi.fn(), changeMetric: vi.fn(), changeDates: vi.fn(), disabledDate: vi.fn(() => false), reset: vi.fn(), retry: vi.fn(),
  };
}

describe("FT-QM-08 query panel using shared controls and renderer", () => {
  it("renders server text/zero/fallback/hint, fixed columns and date only without date filters or normalization", async () => {
    const table = model();
    const { container } = renderWithCmsProviders(<SeoQueriesPanel table={table} />);
    expect(screen.getByRole("group", { name: "Фильтры метрик запросов" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Фильтры метрик страниц" })).not.toBeInTheDocument();
    expect(screen.getByText("1 мин 55 с")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getAllByText("нет значения")).toHaveLength(3);
    expect(screen.getAllByText("23.10.2026")).toHaveLength(3);
    expect(screen.queryByText(/14:05/)).not.toBeInTheDocument();
    expect(container.querySelector('[data-row-key="q1"]')).toBeInTheDocument();
    expect(container.querySelectorAll('th[class*="ant-table-cell-fix-"]')).toHaveLength(2);
    expect(container.querySelectorAll("thead .ant-table-filter-trigger")).toHaveLength(1); // only Query; sizing clone is in tbody
    for (const name of [/Создано/, /20 окт/, /21 окт/]) {
      expect(within(screen.getByRole("columnheader", { name })).queryByRole("button")).not.toBeInTheDocument();
    }
    expect(container.querySelector(".ant-pagination, .ant-select-clear, .ant-picker-clear")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Нормализация|Создать|Удалить|Изменить/ })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Таблица запросов" })).toHaveStyle({ height: "100%", minHeight: "0" });
    expect(screen.getByRole("region", { name: "Прокрутка: Запрос" })).toHaveClass("ant-table-body");
    const value = screen.getByText(table.items[0].query.trim());
    expect(value).toHaveStyle({ width: "280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
    await userEvent.hover(within(screen.getByRole("columnheader", { name: /20 окт/ })).getByText("20 окт"));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Серверная подсказка");
  });

  it("shows loading separately from empty success", () => {
    const table = model();
    const { container, rerender } = renderWithCmsProviders(<SeoQueriesPanel table={{ ...table, loading: true, items: [] }} />);
    expect(container.querySelector(".ant-spin-spinning")).toBeInTheDocument();
    rerender(<SeoQueriesPanel table={{ ...table, items: [], total: 0 }} />);
    expect(container.querySelector(".ant-spin-spinning")).not.toBeInTheDocument();
    expect(screen.getAllByText(/No data|Нет данных/).length).toBeGreaterThan(0);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Повторить" })).not.toBeInTheDocument();
  });

  it("shows error with retry and hides private data/controls on denial", async () => {
    const table = model();
    const { rerender } = renderWithCmsProviders(<SeoQueriesPanel table={{ ...table, error: "Доступ запрещён" }} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Доступ запрещён");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(table.retry).toHaveBeenCalledOnce();
    rerender(<SeoQueriesPanel table={{ ...table, allowed: false }} />);
    expect(screen.getByText("Недостаточно прав")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText("1 мин 55 с")).not.toBeInTheDocument();
  });

  it("routes literal search and explicit clear through callbacks", async () => {
    const table = model();
    renderWithCmsProviders(<SeoQueriesPanel table={table} />);
    await userEvent.click(screen.getByRole("button", { name: "Фильтр: Запрос" }));
    const input = await screen.findByRole("textbox", { name: "Поиск: Запрос" });
    fireEvent.change(input, { target: { value: "  literal %_\\  " } });
    expect(table.changeSearch).toHaveBeenLastCalledWith("  literal %_\\  ");
    await userEvent.click(screen.getByRole("button", { name: /Очистить/ }));
    expect(table.changeSearch).toHaveBeenLastCalledWith("");
    await userEvent.keyboard("{Escape}");
    expect(table.changeSort).not.toHaveBeenCalled();
  });

  it("routes mode and metric controls through shared callbacks", async () => {
    const table = model();
    renderWithCmsProviders(<SeoQueriesPanel table={table} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Режим" }));
    await userEvent.click(screen.getByText("по месяцам", { selector: ".ant-select-item-option-content" }));
    expect(table.changeMode).toHaveBeenCalledWith("month", expect.anything());
    await userEvent.click(screen.getByRole("combobox", { name: "Показатель" }));
    await userEvent.click(screen.getByText("Посетители", { selector: ".ant-select-item-option-content" }));
    expect(table.changeMetric).toHaveBeenCalledWith("users", expect.anything());
  });

  it("routes single server sort and reflects the controlled indicator", () => {
    const table = model();
    const { rerender } = renderWithCmsProviders(<SeoQueriesPanel table={table} />);
    fireEvent.click(screen.getByRole("columnheader", { name: /20 окт/ }));
    expect(table.changeSort).toHaveBeenLastCalledWith(["metric:2026-10-20"]);
    rerender(<SeoQueriesPanel table={{ ...table, sort: ["metric:2026-10-20"] }} />);
    expect(screen.getByRole("columnheader", { name: /20 окт/ })).toHaveAttribute("aria-sort", "ascending");
    fireEvent.click(screen.getByRole("columnheader", { name: /20 окт/ }));
    expect(table.changeSort).toHaveBeenLastCalledWith(["-metric:2026-10-20"]);
    rerender(<SeoQueriesPanel table={{ ...table, sort: ["-metric:2026-10-20"] }} />);
    fireEvent.click(screen.getByRole("columnheader", { name: /Создано/ }));
    expect(table.changeSort).toHaveBeenLastCalledWith(["created_at"]);
    rerender(<SeoQueriesPanel table={{ ...table, sort: ["created_at"] }} />);
    expect(screen.getByRole("columnheader", { name: /20 окт/ })).not.toHaveAttribute("aria-sort");
    expect(screen.getByRole("columnheader", { name: /Создано/ })).toHaveAttribute("aria-sort", "ascending");
  });
});
