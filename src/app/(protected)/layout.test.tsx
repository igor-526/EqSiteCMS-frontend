import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithCmsProviders } from "@/test/render";
import BaseLayout from "./layout";

const routerPushMock = vi.hoisted(() => vi.fn());
const authLogoutMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const clearUserMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: routerPushMock }),
    usePathname: () => "/dashboard",
}));

vi.mock("@/api/auth", () => ({
    authApiLogout: authLogoutMock,
}));

vi.mock("@/contexts/UserContext", () => ({
    useUserContext: () => ({
        user: {
            username: "cms-admin",
            first_name: "Иван",
            last_name: "Иванов",
            middle_name: "Петрович",
        },
        loading: false,
        error: null,
        scopes: ["ADMIN"],
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
    });

    it("renders profile avatar with first letter of username (C for cms-admin)", () => {
        renderLayout();
        // Avatar should show "C" for "cms-admin"
        expect(screen.getByText("C")).toBeInTheDocument();
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
