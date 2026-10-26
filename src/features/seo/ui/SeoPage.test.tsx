import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import { server } from "@/test/msw/server";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import SeoRoute from "@/app/(protected)/seo/page";
import { WebmasterStub } from "./WebmasterStub";

const context = vi.hoisted(() => ({ scopes: [] as KNOWN_USER_SCOPES[] }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));

describe("FT-YX-04 SEO tabs and forbidden", () => {
  const request = vi.fn();
  beforeEach(() => {
    request.mockClear();
    server.use(http.get("http://127.0.0.1/api/yandex/metrica/connection", () => HttpResponse.json({ counter: null })));
    server.use(
      http.get("http://127.0.0.1/api/seo/pages", () => HttpResponse.json({ items: [{ id: "p1", page: "/catalog", created_at: "2026-01-02T03:04:00Z" }], total: 51 })),
      http.get("http://127.0.0.1/api/seo/search-queries", () => HttpResponse.json({ items: [{ id: "q1", query: "horse", created_at: "2026-01-02T03:04:00Z" }], total: 1 })),
    );
    server.events.on("request:start", request);
    return () => server.events.removeListener("request:start", request);
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
      return HttpResponse.json({ items: [{ id: "row", page: "/catalog", query: "horse", created_at: "2026-01-01" }], total: 200 });
    }));
    renderWithCmsProviders(<SeoRoute />);
    await userEvent.click(screen.getByRole("tab", { name: label }));
    await waitFor(() => expect(calls).toHaveLength(1));
    await userEvent.click(screen.getByTitle("2"));
    await waitFor(() => expect(calls.at(-1)?.searchParams.get("offset")).toBe("25"));
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: /50/ }));
    await waitFor(() => expect(calls.at(-1)?.searchParams.get("limit")).toBe("50"));
    expect(calls.at(-1)?.searchParams.get("offset")).toBe("0");
    expect(calls.some(url => url.searchParams.get("limit") === "50" && url.searchParams.get("offset") !== "0")).toBe(false);
    expect(screen.getByTitle("1")).toHaveClass("ant-pagination-item-active");
    await userEvent.click(screen.getByTitle("2"));
    await waitFor(() => expect(calls.at(-1)?.searchParams.get("offset")).toBe("50"));
  });

  it("UT-SEO-11 removes visited data on ADMIN revocation without further reads", async () => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    const { rerender } = renderWithCmsProviders(<SeoRoute />);
    await userEvent.click(screen.getByRole("tab", { name: "Страницы" }));
    await screen.findByText("/catalog");
    const calls = request.mock.calls.length;
    context.scopes = [KNOWN_USER_SCOPES.DEVELOPER];
    rerender(<SeoRoute />);
    expect(screen.getByText("Недостаточно прав")).toBeInTheDocument();
    expect(screen.queryByText("/catalog")).not.toBeInTheDocument();
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
    await userEvent.click(button);
    await screen.findByText("Правил пока нет");
    for (const label of ["Хеш", "Параметры"]) {
      if (label === "Параметры") await userEvent.click(screen.getByRole("tab", { name: label }));
      await userEvent.type(screen.getByRole("textbox"), "test_rule{Enter}");
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
