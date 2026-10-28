import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import SeoRoute from "@/app/(protected)/seo/page";
import { server } from "@/test/msw/server";
import BaseLayout from "@/app/(protected)/layout";
import { NavigationMenu } from "./NavigationMenu";

const state = vi.hoisted(() => ({
  pathname: "/seo", push: vi.fn(), user: { id: "u1" } as { id: string } | null,
}));
vi.mock("next/navigation", () => ({
  usePathname: () => state.pathname,
  useRouter: () => ({ push: state.push }),
}));
vi.mock("@/contexts/UserContext", () => ({
  useUserContext: () => ({ user: state.user, scopes: [KNOWN_USER_SCOPES.SEO], loading: false, error: null, clearUser: vi.fn() }),
}));
vi.mock("@/ui/Sidebar/Sidebar", () => ({ Sidebar: () => <aside /> }));

describe("FT-YX-03 SEO navigation", () => {
  beforeEach(() => {
    state.pathname = "/seo";
    state.user = { id: "u1" };
    state.push.mockClear();
  });

  it.each([[KNOWN_USER_SCOPES.SEO], [KNOWN_USER_SCOPES.SEO, KNOWN_USER_SCOPES.ADMIN]])("shows selected SEO item and RiseOutlined for %j", async (...scopes) => {
    await act(async () => {
      renderWithCmsProviders(<NavigationMenu scopes={scopes} />);
    });
    const item = screen.getByRole("menuitem", { name: "rise SEO" });
    expect(item).toHaveClass("ant-menu-item-selected");
    expect(screen.getByRole("img", { name: "rise" })).toBeInTheDocument();
  });

  it("navigates to /seo", async () => {
    state.pathname = "/dashboard";
    renderWithCmsProviders(<NavigationMenu scopes={[KNOWN_USER_SCOPES.SEO]} />);
    await userEvent.click(screen.getByText("SEO"));
    expect(state.push).toHaveBeenCalledWith("/seo");
  });

  it.each([[], [KNOWN_USER_SCOPES.ADMIN], [KNOWN_USER_SCOPES.SUPERUSER], [KNOWN_USER_SCOPES.DEVELOPER], [KNOWN_USER_SCOPES.USER_MANAGER]])(
    "hides SEO without SEO: %j", async (...scopes) => {
      await act(async () => {
        renderWithCmsProviders(<NavigationMenu scopes={scopes} />);
      });
      expect(screen.queryByText("SEO")).not.toBeInTheDocument();
    },
  );

  it("sets protected page heading to SEO", async () => {
    renderWithCmsProviders(<BaseLayout><div>SEO content</div></BaseLayout>);
    expect(await screen.findByText("SEO", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("SEO content")).toBeInTheDocument();
  });

  it("keeps anonymous route behind the existing login guard", () => {
    state.user = null;
    const request = vi.fn();
    server.events.on("request:start", request);
    try {
      renderWithCmsProviders(<BaseLayout><SeoRoute /></BaseLayout>);
      expect(state.push).toHaveBeenCalledWith("/login");
      expect(screen.queryByRole("tab")).not.toBeInTheDocument();
      expect(screen.queryByText("Недостаточно прав")).not.toBeInTheDocument();
      expect(request).not.toHaveBeenCalled();
    } finally {
      server.events.removeListener("request:start", request);
    }
  });
});
