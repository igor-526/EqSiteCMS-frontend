import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import { renderWithCmsProviders } from "@/test/render";
import type { useSeoPagesTable } from "../hooks/useSeoPagesTable";
import { isPageMetricsDateDisabled } from "../services/pageMetricsOptions";
import type { MetricsMode } from "@/types/api/metricsTable";
import { SeoPagesFilters } from "./SeoPagesFilters";

function model(mode: MetricsMode = "day") {
  return {
    filters: { mode, metric: "visits", dateFrom: "2026-10-01", dateTo: "2026-10-26" },
    metricsTable: { period: { today: "2026-10-26" } },
    changeMode: vi.fn(), changeMetric: vi.fn(), changeDates: vi.fn(),
    disabledDate: (date: dayjs.Dayjs) => isPageMetricsDateDisabled(date, mode, "2026-10-26"),
  } as unknown as ReturnType<typeof useSeoPagesTable>;
}

describe("FT-PM-14 SeoPagesFilters", () => {
  it("has accessible required controls and applies mode and metric immediately", async () => {
    const table = model();
    const { container } = renderWithCmsProviders(<SeoPagesFilters table={table} />);
    expect(screen.getByRole("group", { name: "Фильтры метрик страниц" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("combobox", { name: "Режим" }));
    await userEvent.click(screen.getByText("по неделям", { selector: ".ant-select-item-option-content" }));
    expect(table.changeMode).toHaveBeenCalledWith("week", expect.anything());
    await userEvent.click(screen.getByRole("combobox", { name: "Показатель" }));
    await userEvent.click(screen.getByText("Доля отказов", { selector: ".ant-select-item-option-content" }));
    expect(table.changeMetric).toHaveBeenCalledWith("bounce_rate", expect.anything());
    expect(container.querySelector(".ant-select-clear, .ant-picker-clear")).not.toBeInTheDocument();
  });

  it.each<MetricsMode>(["day", "week", "month", "year"])("uses %s granularity and blocks future units using server today", async mode => {
    const table = model(mode);
    const { container } = renderWithCmsProviders(<SeoPagesFilters table={table} />);
    const start = screen.getByRole("textbox", { name: "Диапазон дат" });
    expect(screen.getByRole("textbox", { name: "Конец диапазона дат" })).toBeInTheDocument();
    expect(start).toHaveValue(mode === "year" ? "2026" : mode === "month" ? "окт. 2026" : mode === "week" ? "28.09.2026 – 04.10.2026" : "01.10.2026");
    await userEvent.click(start);
    const dropdown = document.querySelector<HTMLElement>(".ant-picker-dropdown:not(.ant-picker-dropdown-hidden)")!;
    expect(dropdown).toBeInTheDocument();
    const panelMode = mode === "day" ? "date" : mode;
    expect(dropdown.querySelector(`.ant-picker-${panelMode}-panel`)).toBeInTheDocument();
    expect(dropdown.querySelectorAll(".ant-picker-cell-disabled").length).toBeGreaterThan(0);
    expect(container.querySelector(".ant-picker-clear")).not.toBeInTheDocument();
    expect(table.disabledDate(dayjs("2027-01-04"))).toBe(true);
    expect(table.disabledDate(dayjs("2026-10-26"))).toBe(false);
    expect(within(dropdown).queryByRole("button", { name: /Clear|Очистить/ })).not.toBeInTheDocument();
  });
  it("MANUAL-03 renders Monday-first weeks and clips the current week display to server today", async () => {
    renderWithCmsProviders(<SeoPagesFilters table={model("week")} />);
    expect(screen.getByRole("textbox", { name: "Конец диапазона дат" })).toHaveValue("26.10.2026 – 26.10.2026");
    await userEvent.click(screen.getByRole("textbox", { name: "Диапазон дат" }));
    const dropdown = document.querySelector<HTMLElement>(".ant-picker-dropdown:not(.ant-picker-dropdown-hidden)")!;
    const headers = [...dropdown.querySelectorAll("thead tr")][0].textContent;
    expect(headers).toMatch(/пн.*вт.*ср.*чт.*пт.*сб.*вс/i);
    const sunday = dropdown.querySelector('td[title="2026-10-18"]')!;
    const monday = dropdown.querySelector('td[title="2026-10-19"]')!;
    expect(sunday.closest("tr")).not.toBe(monday.closest("tr"));
    expect(dayjs.locale()).toBe("en");
  });

});
