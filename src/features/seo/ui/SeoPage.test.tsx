import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import { server } from "@/test/msw/server";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import SeoRoute from "@/app/(protected)/seo/page";
import { SEO_ACTIONS, seoScopesRegistry } from "../hooks/useSeoScopes";
import { WebmasterStub } from "./WebmasterStub";

const metrics_table = {
  version: 1, row_key: "id", ordering: null,
  metric: { key: "visits", title: "Визиты", value_type: "integer" },
  period: { mode: "day", date_from: "2026-01-01", date_to: "2026-01-07", today: "2026-01-07", defaulted: true, adjusted: false, clamped: false, requested_date_from: null, requested_date_to: null },
  columns: [],
};
const context = vi.hoisted(() => ({ scopes: [] as KNOWN_USER_SCOPES[] }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));

const request = vi.fn();
beforeEach(() => {
  request.mockClear();
  server.use(http.get("http://127.0.0.1/api/yandex/metrica/connection", () => HttpResponse.json({ counter: null })));
  server.use(
    http.get("http://127.0.0.1/api/seo/pages", () => HttpResponse.json({ items: [{ id: "p1", page: "/catalog", created_at: "2026-01-02T03:04:00Z" }], total: 51, metrics_table })),
    http.get("http://127.0.0.1/api/seo/search-queries", () => HttpResponse.json({ items: [{ id: "q1", query: "horse", created_at: "2026-01-02T03:04:00Z" }], total: 101, metrics_table })),
  );
  server.events.on("request:start", request);
  return () => server.events.removeListener("request:start", request);
});
describe("FT-YX-04 SEO tabs and forbidden", () => {
  it("MANUAL-01 keeps the scoped Reset palette accessible with visible keyboard focus", async () => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    renderWithCmsProviders(<SeoRoute />);
    await userEvent.click(screen.getByRole("tab", { name: "Страницы" }));
    const reset = screen.getByRole("button", { name: /Сбросить/ });
    expect(reset).toHaveStyle({ color: "#a61d24", backgroundColor: "#ffffff" });
    const rules = Array.from(document.styleSheets).flatMap(sheet => Array.from(sheet.cssRules))
      .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
      .filter(rule => [...reset.classList].some(name => rule.selectorText.includes(`.${name}:not(:disabled)`)));
    for (const state of [":hover", ":focus-visible", ":active"]) {
      const rule = rules.find(candidate => candidate.selectorText.includes(state));
      expect(rule, state).toBeDefined();
      expect(rule?.style.getPropertyValue("color")).toBe("rgb(130, 0, 20)");
      expect(rule?.style.getPropertyValue("background-color")).toBe("rgb(255, 255, 255)");
      expect(rule?.style.getPropertyValue("outline")).toBe("");
    }
  });

  it("MANUAL-02 constrains both data tabs to the available height instead of a viewport-sized panel", async () => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    renderWithCmsProviders(<SeoRoute />);
    const tabs = screen.getByRole("region", { name: "SEO" });
    const originalClass = tabs.className;
    await userEvent.click(screen.getByRole("tab", { name: "Страницы" }));
    expect(tabs).toHaveStyle({ height: "100%", minHeight: "0" });
    expect(screen.getByRole("region", { name: "Таблица страниц" })).toHaveStyle({ height: "100%", minHeight: "0" });
    const rules = Array.from(document.styleSheets).flatMap(sheet => Array.from(sheet.cssRules))
      .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule);
    expect(rules.some(rule => rule.selectorText.includes(".ant-tabs-content-holder") && ["0", "0px"].includes(rule.style.getPropertyValue("min-height")))).toBe(true);
    await userEvent.click(screen.getByRole("tab", { name: "Запросы" }));
    expect(tabs.className).not.toBe(originalClass);
    expect(screen.getByRole("region", { name: "Таблица запросов" })).toHaveStyle({ height: "100%", minHeight: "0" });
    await userEvent.click(screen.getByRole("tab", { name: "Яндекс.Вебмастер" }));
    expect(tabs.className).toBe(originalClass);
  });

  it("renders thin route with Metrica selected, switches to Webmaster without requests", async () => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    renderWithCmsProviders(<SeoRoute />);
    expect(screen.getByRole("tab", { name: "Яндекс.Метрика" })).toHaveAttribute("aria-selected", "true");
    expect(await screen.findByText("Яндекс.Метрика не привязана")).toBeInTheDocument();
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    request.mockClear();
    await userEvent.click(screen.getByRole("tab", { name: "Яндекс.Вебмастер" }));
    expect(screen.getByRole("tab", { name: "Яндекс.Вебмастер" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Функционал в разработке")).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it("keeps only tabs in the tablist, links panels and supports roving keyboard focus", async () => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    renderWithCmsProviders(<SeoRoute />);
    const tablist = screen.getByRole("tablist");
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs).toHaveLength(4);
    expect(tablist.closest(".ant-tabs")).toBeInTheDocument();
    expect(within(tablist).queryByRole("button")).not.toBeInTheDocument();
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    expect(tabs[1]).toHaveAttribute("tabindex", "-1");
    act(() => tabs[0].focus());
    await userEvent.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel", { name: /Яндекс.Вебмастер/ });
    expect(tabs[1]).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", tabs[1].id);
    await userEvent.keyboard("{ArrowRight}");
    expect(tabs[2]).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(tabs[1]).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(tabs[0]).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(tabs[3]).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(tabs[0]).toHaveAttribute("tabindex", "-1");
    expect(tabs[3]).toHaveAttribute("tabindex", "0");
    const queryPanel = screen.getByRole("tabpanel", { name: /Запросы/ });
    expect(tabs[3]).toHaveAttribute("aria-controls", queryPanel.id);
  });

  it("UT-SEO-11 activates SEO reads only on visit and preserves each table state", async () => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    renderWithCmsProviders(<SeoRoute />);
    expect(screen.getByRole("region", { name: "SEO" })).toBeInTheDocument();
    await screen.findByText("Яндекс.Метрика не привязана");
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    await userEvent.click(screen.getByRole("tab", { name: "Страницы" }));
    await screen.findByText("/catalog");
    await userEvent.click(screen.getByTitle("2"));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
    await userEvent.click(screen.getByRole("tab", { name: "Запросы" }));
    await screen.findByText("horse");
    expect(screen.getByRole("tab", { name: "Запросы" })).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByRole("button", { name: "Нормализация" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Страницы" }));
    expect(screen.getByTitle("2")).toHaveClass("ant-pagination-item-active");
    expect(screen.getByText("/catalog")).toBeInTheDocument();
  });

  it.each(["Страницы", "Запросы"])("F01 real paginator resets size on %s despite both callbacks", async label => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    const calls: URL[] = [];
    const resource = label === "Страницы" ? "pages" : "search-queries";
    server.use(http.get(`http://127.0.0.1/api/seo/${resource}`, ({ request: incoming }) => {
      calls.push(new URL(incoming.url));
      return HttpResponse.json({ items: [{ id: "row", page: "/catalog", query: "horse", created_at: "2026-01-01" }], total: 200, metrics_table });
    }));
    renderWithCmsProviders(<SeoRoute />);
    await userEvent.click(screen.getByRole("tab", { name: label }));
    await waitFor(() => expect(calls).toHaveLength(1));
    await userEvent.click(screen.getByTitle("2"));
    await waitFor(() => expect(calls.at(-1)?.searchParams.get("offset")).toBe("25"));
    await userEvent.click(screen.getByRole("combobox", { name: /Page Size|Размер страницы/i }));
    await userEvent.click(await screen.findByRole("option", { name: /50/ }));
    await waitFor(() => expect(calls.at(-1)?.searchParams.get("limit")).toBe("50"));
    expect(calls.at(-1)?.searchParams.get("offset")).toBe("0");
    expect(calls.some(url => url.searchParams.get("limit") === "50" && url.searchParams.get("offset") !== "0")).toBe(false);
    expect(screen.getByTitle("1")).toHaveClass("ant-pagination-item-active");
    await userEvent.click(screen.getByTitle("2"));
    await waitFor(() => expect(calls.at(-1)?.searchParams.get("offset")).toBe("50"));
  });

  it.each(["Страницы", "Запросы"])("FT-QM-09 removes visited %s data on ADMIN revocation without further reads", async label => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    const { rerender } = renderWithCmsProviders(<SeoRoute />);
    await userEvent.click(screen.getByRole("tab", { name: label }));
    await screen.findByText(label === "Страницы" ? "/catalog" : "horse");
    const calls = request.mock.calls.length;
    context.scopes = [KNOWN_USER_SCOPES.DEVELOPER];
    rerender(<SeoRoute />);
    expect(screen.getByText("Недостаточно прав")).toBeInTheDocument();
    expect(screen.queryByText(label === "Страницы" ? "/catalog" : "horse")).not.toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(calls);
  });

  it("UT-SEO-17 pages normalization CRUD for both collections leaves pages untouched", async () => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    const create = vi.fn();
    const remove = vi.fn();
    for (const collection of ["blacklisted-hashes", "blacklisted-query-params"]) {
      let items: { id: string; value: string; created_at: string }[] = [];
      const url = `http://127.0.0.1/api/seo/page-normalization/${collection}`;
      server.use(
        http.get(url, () => HttpResponse.json({ items, total: items.length })),
        http.post(url, async ({ request: incoming }) => {
          const body = await incoming.json() as { value: string };
          create(body);
          const item = { id: "rule-id", value: body.value, created_at: "2026-01-01" };
          items = [item];
          return HttpResponse.json(item, { status: 201 });
        }),
        http.delete(`${url}/rule-id`, () => {
          remove(collection); items = [];
          return new HttpResponse(null, { status: 204 });
        }),
      );
    }
    renderWithCmsProviders(<SeoRoute />);
    expect(screen.queryByRole("button", { name: "Нормализация" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Страницы" }));
    await screen.findByText("/catalog");
    const button = screen.getByRole("button", { name: "Нормализация" });
    expect(button.closest('[role="tablist"]')).toBeNull();
    expect(within(screen.getByRole("tablist")).queryByRole("button")).not.toBeInTheDocument();
    expect(within(screen.getByRole("tablist")).getAllByRole("tab")).toHaveLength(4);
    expect(button.closest(".ant-pagination")).toBeNull();
    const actions = button.closest('[aria-label="Управление страницами"]')! as HTMLElement;
    expect(within(actions).getByRole("button", { name: /Сбросить/ })).toBeInTheDocument();
    expect(actions.querySelector(".ant-pagination")).toBeInTheDocument();
    await userEvent.click(button);
    await screen.findByText("Правил пока нет");
    for (const label of ["Хеш", "Параметры"]) {
      if (label === "Параметры") await userEvent.click(screen.getByRole("tab", { name: label }));
      await userEvent.type(within(screen.getByRole("dialog")).getByRole("textbox"), "test_rule{Enter}");
      await userEvent.click(await screen.findByRole("button", { name: "Удалить test_rule" }));
      await userEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
      await waitFor(() => expect(screen.getAllByRole("dialog")).toHaveLength(1));
      await screen.findByText("Правил пока нет");
    }
    expect(create).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledTimes(2);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(button).toHaveFocus();
    expect(screen.getByText("/catalog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Яндекс.Вебмастер" }));
    expect(screen.queryByRole("button", { name: "Нормализация" })).not.toBeInTheDocument();
    expect(screen.getByText("Функционал в разработке")).toBeInTheDocument();
  }, 15000);

  it("FT-PM-12 hides normalization without its action permission", async () => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    const previous = seoScopesRegistry[SEO_ACTIONS.LIST_NORMALIZATION];
    seoScopesRegistry[SEO_ACTIONS.LIST_NORMALIZATION] = [];
    try {
      renderWithCmsProviders(<SeoRoute />);
      await userEvent.click(screen.getByRole("tab", { name: "Страницы" }));
      await screen.findByText("/catalog");
      expect(screen.getByRole("button", { name: /Сбросить/ })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Нормализация" })).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole("tab", { name: "Запросы" }));
      expect(screen.getByRole("button", { name: /Сбросить/ })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Нормализация" })).not.toBeInTheDocument();
    } finally { seoScopesRegistry[SEO_ACTIONS.LIST_NORMALIZATION] = previous; }
  });

  it("FT-PM-12 surfaces backend 403 as an error with retry, not empty success", async () => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    server.use(http.get("http://127.0.0.1/api/seo/pages", () => HttpResponse.json({ detail: "Доступ запрещён" }, { status: 403 })));
    renderWithCmsProviders(<SeoRoute />);
    await userEvent.click(screen.getByRole("tab", { name: "Страницы" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Доступ запрещён");
    expect(screen.getByRole("button", { name: "Повторить" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders standalone Webmaster placeholder without requests", () => {
    renderWithCmsProviders(<WebmasterStub />);
    expect(screen.getByText("Функционал в разработке")).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it.each([[], [KNOWN_USER_SCOPES.SUPERUSER], [KNOWN_USER_SCOPES.DEVELOPER], [KNOWN_USER_SCOPES.USER_MANAGER]])(
    "blocks direct route without ADMIN: %j", (...scopes) => {
      context.scopes = scopes;
      renderWithCmsProviders(<SeoRoute />);
      expect(screen.getByText("Недостаточно прав")).toBeInTheDocument();
      const denial = screen.getByRole("region", { name: "Доступ к SEO" });
      expect(denial).toHaveAttribute("tabindex", "0");
      denial.focus();
      expect(denial).toHaveFocus();
      expect(screen.queryByRole("tab")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(request).not.toHaveBeenCalled();
    },
  );
});

describe("FT-QM-08..10 query toolbar and API boundary", () => {
  it.each([400, 401, 403, 502])("FT-QM-08/09 query error %s preserves filters and retries through backend boundary", async status => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    const calls: URL[] = [];
    const refresh = vi.fn(() => HttpResponse.json({ detail: "No session" }, { status: 401 }));
    server.use(http.post("http://127.0.0.1/api/auth/refresh", refresh));
    server.use(http.get("http://127.0.0.1/api/seo/search-queries", ({ request: incoming }) => {
      calls.push(new URL(incoming.url));
      if (calls.length === 1) return HttpResponse.json({ detail: "Ошибка аналитики" }, { status });
      return HttpResponse.json({ items: [], total: 0, metrics_table });
    }));
    renderWithCmsProviders(<SeoRoute />);
    await userEvent.click(screen.getByRole("tab", { name: "Запросы" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(status === 401 ? "Authentication failed" : "Ошибка аналитики");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    const actions = screen.getByLabelText("Управление запросами");
    expect(actions.closest('[role="tablist"]')).toBeNull();
    expect(within(actions).getByRole("button", { name: /Сбросить/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Нормализация" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Повторить" }));
    await screen.findAllByRole("table");
    expect(calls).toHaveLength(2);
    expect(refresh).toHaveBeenCalledTimes(status === 401 ? 1 : 0);
    expect(calls[1].search).toBe(calls[0].search);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getAllByText(/No data|Нет данных/).length).toBeGreaterThan(0);
  });

  it("FT-QM-08/10 query reset cancels pending debounce with one request and preserves metrics", async () => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    const calls: URL[] = [];
    server.use(http.get("http://127.0.0.1/api/seo/search-queries", ({ request: incoming }) => {
      const url = new URL(incoming.url);
      calls.push(url);
      return HttpResponse.json({ items: [{ id: "q1", query: "horse", created_at: "2026-01-02T03:04:00Z" }], total: 101,
        metrics_table: { ...metrics_table, ordering: url.searchParams.get("ordering") } });
    }));
    renderWithCmsProviders(<SeoRoute />);
    fireEvent.click(screen.getByRole("tab", { name: "Запросы" }));
    await screen.findByText("horse");
    // Keep assertions within the active surface, not retained hidden tab trees.
    const panel = within(screen.getByRole("tabpanel", { name: "Запросы" }));
    const actions = within(screen.getByLabelText("Управление запросами"));
    expect(calls[0].searchParams.get("mode")).toBe("day");
    expect(calls[0].searchParams.get("metric")).toBe("visits");
    expect(calls[0].searchParams.has("date_from")).toBe(false);
    fireEvent.click(panel.getByRole("columnheader", { name: /Создано/ }));
    await waitFor(() => expect(calls.at(-1)?.searchParams.get("ordering")).toBe("created_at"));
    fireEvent.click(actions.getByTitle("2"));
    await waitFor(() => expect(calls.at(-1)?.searchParams.get("offset")).toBe("25"));
    fireEvent.click(panel.getByRole("button", { name: "Фильтр: Запрос" }));
    const input = await screen.findByRole("textbox", { name: "Поиск: Запрос" });
    // Dispatch draft and reset synchronously: user-event pointer delays under CPU
    // contention must not accidentally let the 300ms debounce expire first.
    // Real elapsed time below still proves no delayed request escapes reset.
    fireEvent.change(input, { target: { value: "pending" } });
    const before = calls.length;
    fireEvent.click(actions.getByRole("button", { name: /Сбросить/ }));
    await waitFor(() => expect(calls).toHaveLength(before + 1));
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 350)); });
    expect(calls).toHaveLength(before + 1);
    expect(Object.fromEntries(calls.at(-1)!.searchParams)).toEqual({ limit: "25", offset: "0", mode: "day", metric: "visits", date_from: "2026-01-01", date_to: "2026-01-07" });
    fireEvent.click(panel.getByRole("button", { name: "Фильтр: Запрос" }));
    expect(await screen.findByRole("textbox", { name: "Поиск: Запрос" })).toHaveValue("");
  });

  it("FT-QM-10 query reset leaves page pagination and normalization unchanged", async () => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    renderWithCmsProviders(<SeoRoute />);
    fireEvent.click(screen.getByRole("tab", { name: "Страницы" }));
    await screen.findByText("/catalog");
    fireEvent.click(screen.getByTitle("2"));
    fireEvent.click(screen.getByRole("tab", { name: "Запросы" }));
    await screen.findByText("horse");
    fireEvent.click(screen.getByRole("button", { name: /Сбросить/ }));
    fireEvent.click(screen.getByRole("tab", { name: "Страницы" }));
    expect(screen.getByTitle("2")).toHaveClass("ant-pagination-item-active");
    expect(screen.getByRole("button", { name: "Нормализация" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Яндекс.Вебмастер" }));
    expect(screen.queryByRole("button", { name: /Сбросить|Нормализация/ })).not.toBeInTheDocument();
  });

});
