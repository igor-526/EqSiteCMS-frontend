import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserProvider, useUserContext } from "./UserContext";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import type { UUID } from "crypto";

const routerPush = vi.hoisted(() => vi.fn());
const getUserInfo = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
    usePathname: () => "/horses",
    useRouter: () => ({ push: routerPush }),
}));

vi.mock("@/api/user", () => ({ getUserInfo }));

const Probe = () => {
    const { user, loading, scopes } = useUserContext();
    return <div>{loading ? "loading" : user?.username ?? "anonymous"}:{scopes.join(",")}</div>;
};

describe("UserProvider protected /horses route", () => {
    beforeEach(() => vi.clearAllMocks());

    it("redirects anonymous API denial to login", async () => {
        getUserInfo.mockResolvedValue({ status: "error", data: { detail: "Unauthorized" } });
        render(<UserProvider><Probe /></UserProvider>);
        await waitFor(() => expect(routerPush).toHaveBeenCalledWith("/login"));
        expect(screen.getByText("anonymous:")).toBeInTheDocument();
    });

    it("renders authenticated user and existing scope", async () => {
        getUserInfo.mockResolvedValue({
            status: "ok",
            data: {
                id: "00000000-0000-4000-8000-000000000001" as UUID,
                equestrian_id: "00000000-0000-4000-8000-000000000002" as UUID,
                username: "cms-admin",
                first_name: null,
                last_name: null,
                middle_name: null,
                created_at: "2026-01-01T00:00:00Z",
                updated_at: null,
                scopes: [{
                    id: "00000000-0000-4000-8000-000000000003" as UUID,
                    scope_name: KNOWN_USER_SCOPES.ADMIN,
                    scope_description: null,
                    created_at: "2026-01-01T00:00:00Z",
                    updated_at: null,
                }],
            },
        });
        render(<UserProvider><Probe /></UserProvider>);
        expect(await screen.findByText("cms-admin:ADMIN")).toBeInTheDocument();
        expect(routerPush).not.toHaveBeenCalled();
    });
});
