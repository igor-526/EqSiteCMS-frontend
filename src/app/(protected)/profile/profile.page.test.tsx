import React from "react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithCmsProviders } from "@/test/render";
import { server } from "@/test/msw/server";
import ProfilePage from "./page";
import type { UUID } from "crypto";

const apiUrl = (path: string) => `http://127.0.0.1/api${path}`;

const userId = "00000000-0000-4000-8000-000000000010" as UUID;
const equestrianId = "00000000-0000-4000-8000-000000000011" as UUID;

const mockProfile = {
    id: userId,
    equestrian_id: equestrianId,
    username: "cms-admin",
    first_name: "Иван",
    last_name: "Иванов",
    middle_name: null,
    equestrian_name: "Конюшня Звезда",
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: null,
    scopes: [],
};

const notificationMock = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
}));

const routerPushMock = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useNotification", () => ({
    useNotification: () => notificationMock,
}));

vi.mock("@/contexts/UserContext", () => ({
    useUserContext: () => ({
        user: { username: "cms-admin", first_name: "Иван", last_name: "Иванов", middle_name: null },
        loading: false,
        error: null,
        scopes: [],
        refreshUser: vi.fn(),
        clearUser: vi.fn(),
    }),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: routerPushMock }),
    usePathname: () => "/profile",
}));

describe("ProfilePage", () => {
    it("authenticated render — shows profile data after MSW mock", async () => {
        server.use(
            http.get(apiUrl("/users/me"), () => HttpResponse.json(mockProfile)),
        );

        renderWithCmsProviders(<ProfilePage />);

        await waitFor(() => {
            // Profile header shows name
            expect(screen.getByText("Иванов Иван")).toBeInTheDocument();
        });

        // Personal data form is rendered
        expect(screen.getByRole("button", { name: /Сохранить/i })).toBeInTheDocument();
        // Password form is rendered
        expect(screen.getByRole("button", { name: /Сменить пароль/i })).toBeInTheDocument();
    });
});
