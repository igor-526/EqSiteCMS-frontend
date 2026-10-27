import React from "react";
import { ConfigProvider } from "antd";
import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithCmsProviders } from "@/test/render";
import type { SeoDataResource } from "@/types/api/seo";
import { SeoDataTable, type SeoDataTableProps } from "./SeoDataTable";

// WCAG relative luminance for the fixed local palette, not a browser axe substitute.
function contrastOnWhite(hex: string) {
  const channels = hex.replace("#", "").match(/.{2}/g) ?? [];
  const linear = channels.map(channel => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  return 1.05 / (luminance + 0.05);
}

function tableState(resource: SeoDataResource): ReturnType<typeof import("../hooks/useSeoDataTable").useSeoDataTable> {
  return {
    resource, allowed: true, searchDraft: "", changeSearch: vi.fn(),
    filters: { limit: 25, offset: 0, search: undefined }, setFilters: vi.fn(),
    sort: [], changeSort: vi.fn(), items: [{ id: "stable-uuid", [resource === "pages" ? "page" : "query"]: "long value ".repeat(50), created_at: "2026-01-02T03:04:00" }] as SeoDataTableProps["table"]["items"],
    total: 101, loading: false, error: null, retry: vi.fn(),
  };
}

describe.each<SeoDataResource>(["pages", "queries"])("UT-SEO-07..10 table %s", resource => {
  const label = resource === "pages" ? "Страница" : "Запрос";
  const field = resource === "pages" ? "page" : "query";
  const Panel = SeoDataTable;

  it("renders value as bounded text with tooltip, date, UUID key, no CRUD or toolbar", async () => {
    const table = tableState(resource);
    const { container } = renderWithCmsProviders(<Panel table={table} />);
    const value = screen.getByText("long value ".repeat(50).trim());
    expect(value.tagName).toBe("SPAN");
    expect(value.className).not.toBe("");
    expect(value.closest("a")).toBeNull();
    expect(container.querySelector('[data-row-key="stable-uuid"]')).toBeInTheDocument();
    expect(screen.getByText("02.01.2026 03:04")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Создать|Удалить|Изменить|Нормализация/ })).not.toBeInTheDocument();
    await userEvent.hover(value);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("long value");
  });

  it("renders a distinct loading spinner", () => {
    const table = { ...tableState(resource), loading: true, items: [] };
    const { container } = renderWithCmsProviders(<Panel table={table} />);
    expect(container.querySelector(".ant-spin-spinning")).toBeInTheDocument();
  });

  it("renders empty success with no error or retry", () => {
    renderWithCmsProviders(<Panel table={{ ...tableState(resource), items: [], total: 0 }} />);
    expect(screen.getAllByText(/No data|Нет данных/).length).toBeGreaterThan(0);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Повторить" })).not.toBeInTheDocument();
  });

  it("renders errors separately from empty and invokes retry", async () => {
    const table = { ...tableState(resource), error: "Запрос запрещён" };
    renderWithCmsProviders(<Panel table={table} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Запрос запрещён");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(table.retry).toHaveBeenCalledOnce();
  });

  it("keeps search in header dropdown only with controlled draft and clear callback", async () => {
    const table = { ...tableState(resource), searchDraft: "two words" };
    renderWithCmsProviders(<ConfigProvider theme={{ token: { motion: false } }}><Panel table={table} /></ConfigProvider>);
    const valueHeader = screen.getByRole("columnheader", { name: new RegExp(label) });
    const dateHeader = screen.getByRole("columnheader", { name: "Создано" });
    expect(within(dateHeader).queryByRole("button")).not.toBeInTheDocument();
    expect(dateHeader).not.toHaveAttribute("tabindex");
    expect(within(valueHeader).getByRole("button")).toHaveClass("ant-table-filter-trigger");
    expect(within(dateHeader).queryByRole("button")).not.toBeInTheDocument();
    await userEvent.click(within(valueHeader).getByRole("button"));
    const input = await screen.findByRole("textbox", { name: `Поиск: ${label}` });
    expect(document.querySelector("button button")?.parentElement?.closest("button")?.outerHTML).toBeUndefined();
    expect(input).toHaveValue("two words");
    fireEvent.change(input, { target: { value: "two words more " } });
    expect(table.changeSearch).toHaveBeenLastCalledWith("two words more ");
    await userEvent.click(screen.getByRole("button", { name: /Очистить/ }));
    expect(table.changeSearch).toHaveBeenLastCalledWith("");
    await vi.waitFor(() => expect(screen.getByRole("textbox", { name: `Поиск: ${label}` })).toBeVisible());
    expect(screen.getByRole("button", { name: `Фильтр: ${label}` })).toHaveAttribute("aria-expanded", "true");
    expect(table.changeSort).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Найти" })).not.toBeInTheDocument();
  });

  it("R1 scopes accessible clear colors to SEO in normal, hover, focus and active states", async () => {
    renderWithCmsProviders(<ConfigProvider theme={{ token: { motion: false } }}><Panel table={tableState(resource)} /></ConfigProvider>);
    await userEvent.click(screen.getByRole("button", { name: `Фильтр: ${label}` }));
    const clear = await screen.findByRole("button", { name: /Очистить/ });
    expect(clear).toHaveStyle({ color: "#a61d24", backgroundColor: "#ffffff" });
    const panel = clear.closest<HTMLElement>("[data-seo-filter]");
    expect(panel).toHaveAttribute("data-seo-filter", resource);
    const scopedRules = Array.from(document.styleSheets)
      .flatMap(sheet => Array.from(sheet.cssRules))
      .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
      .filter(rule => rule.selectorText.includes(`.${panel?.classList[0]}`) && rule.selectorText.includes(".ant-btn-color-dangerous"));
    for (const state of [":hover", ":focus-visible", ":active"]) {
      const rule = scopedRules.find(candidate => candidate.selectorText.includes(state));
      expect(rule, state).toBeDefined();
      expect(rule?.style.getPropertyValue("color")).toBe("rgb(130, 0, 20)");
      expect(rule?.style.getPropertyValue("background-color")).toBe("rgb(255, 255, 255)");
    }
    for (const color of ["#a61d24", "#820014"]) expect(contrastOnWhite(color)).toBeGreaterThanOrEqual(4.5);
    expect(clear).toHaveClass("ant-btn-variant-outlined");
  });

  it("F03 reaches filter with Tab, opens with Enter, closes with Escape without sorting", async () => {
    const user = userEvent.setup();
    const table = tableState(resource);
    renderWithCmsProviders(<Panel table={table} />);
    const trigger = screen.getByRole("button", { name: `Фильтр: ${label}` });
    for (let index = 0; index < 20 && document.activeElement !== trigger; index += 1) await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard("{Enter}");
    const input = await screen.findByRole("textbox", { name: `Поиск: ${label}` });
    await vi.waitFor(() => expect(input).toHaveFocus());
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.type(input, "test{Escape}");
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(table.changeSort).not.toHaveBeenCalled();
    expect(table.changeSearch).toHaveBeenCalled();
  });

  it("SF-02/03 reflects applied search, opens with Space and closes outside without sorting", async () => {
    const user = userEvent.setup();
    const table = { ...tableState(resource), searchDraft: " pending " };
    const { rerender } = renderWithCmsProviders(<Panel table={table} />);
    const trigger = screen.getByRole("button", { name: `Фильтр: ${label}` });
    expect(trigger).not.toHaveClass("active");
    rerender(<Panel table={{ ...table, filters: { ...table.filters, search: "applied" } }} />);
    expect(trigger).toHaveClass("active");
    trigger.focus();
    await user.keyboard(" ");
    const input = await screen.findByRole("textbox", { name: `Поиск: ${label}` });
    await vi.waitFor(() => expect(input).toHaveFocus());
    await user.keyboard("{Enter}");
    await user.tab();
    expect(screen.getByRole("button", { name: /Очистить/ })).toHaveFocus();
    await user.click(screen.getByText("02.01.2026 03:04"));
    await vi.waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    expect(table.changeSort).not.toHaveBeenCalled();
    expect(table.changeSearch).not.toHaveBeenCalled();
    await user.click(trigger);
    expect(await screen.findByRole("textbox", { name: `Поиск: ${label}` })).toHaveValue(" pending ");
  });

  it("F03 makes the actual table scroll body focusable, also after sort remount", async () => {
    const table = tableState(resource);
    const { rerender } = renderWithCmsProviders(<Panel table={table} />);
    const body = screen.getByRole("region", { name: `Прокрутка: ${label}` });
    expect(body).toHaveClass("ant-table-body");
    expect(body).toHaveAttribute("tabindex", "0");
    body.focus();
    expect(body).toHaveFocus();
    rerender(<Panel table={{ ...table, sort: [field] }} />);
    const nextBody = screen.getByRole("region", { name: `Прокрутка: ${label}` });
    expect(nextBody).not.toBe(body);
    expect(nextBody).toHaveAttribute("tabindex", "0");
  });

  it("F03-R1 disables only the sizing filter and skips it after scroll focus, also after sort remount", async () => {
    const user = userEvent.setup();
    const table = tableState(resource);
    const { container, rerender } = renderWithCmsProviders(<Panel table={table} />);
    for (const sort of [[], [field], [`-${field}`], []]) {
      rerender(<Panel table={{ ...table, sort }} />);
      const sizingRow = container.querySelector('.ant-table-measure-row[aria-hidden="true"]');
      expect(sizingRow).toBeInTheDocument();
      const hiddenTrigger = within(sizingRow as HTMLElement).getByRole("button", { name: `Фильтр: ${label}`, hidden: true });
      const visibleTrigger = screen.getByRole("button", { name: `Фильтр: ${label}` });
      expect(hiddenTrigger).not.toBe(visibleTrigger);
      expect(hiddenTrigger).toHaveAttribute("inert");
      expect(hiddenTrigger).toHaveAttribute("aria-disabled", "true");
      expect(hiddenTrigger).not.toHaveAttribute("tabindex");
      expect(visibleTrigger).toBeEnabled();
      expect(visibleTrigger).not.toHaveAttribute("tabindex", "-1");
      const body = screen.getByRole("region", { name: `Прокрутка: ${label}` });
      body.focus();
      hiddenTrigger.focus();
      expect(body).toHaveFocus();
      fireEvent.keyDown(visibleTrigger, { key: "Enter" });
      const input = await screen.findByRole("textbox", { name: `Поиск: ${label}` });
      expect(input).toHaveFocus();
      expect(screen.getAllByRole("textbox", { name: `Поиск: ${label}` })).toHaveLength(1);
      fireEvent.keyDown(input, { key: "Escape" });
      expect(visibleTrigger).toHaveFocus();
      expect(visibleTrigger).toHaveAttribute("aria-expanded", "false");
    }
    // Tab once after the final remount; every intermediate clone above is
    // already checked for native disabled semantics and programmatic focus.
    await user.tab();
    expect(document.activeElement?.closest('[aria-hidden="true"]')).toBeNull();
    expect(table.changeSort).not.toHaveBeenCalled();
  }, 30000);

  it("maps header sorts and renders controlled order; page selection calls paginator adapter", async () => {
    const table = tableState(resource);
    const { rerender } = renderWithCmsProviders(<Panel table={table} />);
    await userEvent.click(screen.getByRole("columnheader", { name: new RegExp(label) }));
    expect(table.changeSort).toHaveBeenLastCalledWith([field]);
    rerender(<Panel table={{ ...table, sort: [field] }} />);
    expect(screen.getByRole("columnheader", { name: new RegExp(label) })).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(screen.getByRole("columnheader", { name: new RegExp(label) }));
    expect(table.changeSort).toHaveBeenLastCalledWith([`-${field}`]);
    rerender(<Panel table={{ ...table, sort: [`-${field}`] }} />);
    await userEvent.click(screen.getByRole("columnheader", { name: new RegExp(label) }));
    expect(table.changeSort).toHaveBeenLastCalledWith([]);
    await userEvent.click(screen.getByTitle("2"));
    const update = vi.mocked(table.setFilters).mock.calls[0][0];
    expect(typeof update === "function" ? update(table.filters) : update).toMatchObject({ limit: 25, offset: 25 });
  });

  it("hides all data and controls without permission", () => {
    renderWithCmsProviders(<SeoDataTable table={{ ...tableState(resource), allowed: false }} />);
    expect(screen.getByText("Недостаточно прав")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});


describe("FT-PM-13 page table options", () => {
  it("shows date only, fixes columns, sorts date and appends metrics without pagination", async () => {
    const table = tableState("pages");
    const { container } = renderWithCmsProviders(<SeoDataTable table={table} dateOnly fixedColumns hidePagination
      filtersElements={<div>SEO filters</div>}
      additionalColumns={[{ key: "metric:2026-01-02", title: "2 янв", sorter: true, render: () => "16,67%" }]} />);
    expect(screen.getByText("02.01.2026")).toBeInTheDocument();
    expect(screen.queryByText("02.01.2026 03:04")).not.toBeInTheDocument();
    expect(screen.getByText("16,67%")).toBeInTheDocument();
    expect(screen.getByText("SEO filters")).toBeInTheDocument();
    expect(container.querySelector(".ant-pagination")).not.toBeInTheDocument();
    expect(container.querySelectorAll('th[class*="ant-table-cell-fix-"]')).toHaveLength(2);
    await userEvent.click(screen.getByRole("columnheader", { name: /Создано/ }));
    expect(table.changeSort).toHaveBeenLastCalledWith(["created_at"]);
  });
});
