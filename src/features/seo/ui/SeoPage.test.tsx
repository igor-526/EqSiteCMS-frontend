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
    expect(tabs).toHaveLength(2);
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
    expect(tabs[0]).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(tabs[1]).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(tabs[0]).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(tabs[1]).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(tabs[0]).toHaveAttribute("tabindex", "-1");
    expect(tabs[1]).toHaveAttribute("tabindex", "0");
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
