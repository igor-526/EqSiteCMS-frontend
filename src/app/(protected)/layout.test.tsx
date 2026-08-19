import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import BaseLayout from "./layout";

const routerPushMock = vi.hoisted(() => vi.fn());
const authLogoutMock = vi.hoisted(() => vi.fn().mockResolvedValue(true));
const clearUserMock = vi.hoisted(() => vi.fn());
const authState = vi.hoisted(() => ({ user: { username: "cms-admin", first_name: "Иван", last_name: "Иванов", middle_name: "Петрович" } as null | Record<string, string>, loading: false, scopes: ["ADMIN"] as string[] }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
  usePathname: () => "/dashboard",
}));

vi.mock("@/api/auth", () => ({
  authApiLogout: authLogoutMock,
}));

vi.mock("@/contexts/UserContext", () => ({
  useUserContext: () => ({
    user: authState.user,
    loading: authState.loading,
    error: null,
    scopes: authState.scopes,
    refreshUser: vi.fn(),
    clearUser: clearUserMock,
  }),
}));

function renderLayout() {
  return renderWithCmsProviders(
    <BaseLayout>
      <div>page content</div>
    </BaseLayout>,
  );
}

describe("BaseLayout sidebar — profile section", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { username: "cms-admin", first_name: "Иван", last_name: "Иванов", middle_name: "Петрович" };
    authState.loading = false;
    authState.scopes = ["ADMIN"];
  });

  it("blocks protected content and redirects anonymous users to login", async () => {
    authState.user = null;
    renderLayout();
    expect(screen.queryByText("page content")).not.toBeInTheDocument();
    await vi.waitFor(() => expect(routerPushMock).toHaveBeenCalledWith("/login"));
  });

  it("renders profile avatar with first letter of username (C for cms-admin)", () => {
    renderLayout();
    // Avatar should show "C" for "cms-admin"
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it.each(["ADMIN", "SUPERUSER", "DEVELOPER", "USER_MANAGER"])("shows notifications navigation to authenticated %s", async (scope) => {
    authState.scopes = [scope];
    renderLayout();
    const item = screen.getByText("Уведомления");
    expect(item).toBeInTheDocument();
    await userEvent.click(item);
    expect(routerPushMock).toHaveBeenCalledWith("/notifications");
  });

  it("clicking profile item navigates to /profile", async () => {
    renderLayout();
    const profileBtn = screen.getByRole("button", { name: "Профиль" });
    await userEvent.click(profileBtn);
    expect(routerPushMock).toHaveBeenCalledWith("/profile");
  });

  it("clicking logout calls clearUser, authApiLogout, and redirects to /login", async () => {
    renderLayout();
    const logoutBtn = screen.getByRole("button", { name: /Выйти/i });
    await userEvent.click(logoutBtn);
    expect(clearUserMock).toHaveBeenCalled();
    expect(authLogoutMock).toHaveBeenCalled();
    expect(routerPushMock).toHaveBeenCalledWith("/login");
  });
});
