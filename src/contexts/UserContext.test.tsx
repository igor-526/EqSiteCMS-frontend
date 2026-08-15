import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserProvider, useUserContext } from "./UserContext";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import type { UUID } from "crypto";

const getUserInfo = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: () => "/horses",
}));

vi.mock("@/api/user", () => ({ getUserInfo }));

const Probe = () => {
  const { user, loading, error, scopes } = useUserContext();
  return (
    <div>
      <span data-testid="status">
        {loading ? "loading" : user ? "authenticated" : "unauthenticated"}
      </span>
      <span data-testid="username">{user?.username ?? "anonymous"}</span>
      <span data-testid="scopes">{scopes.join(",")}</span>
      {error && <span data-testid="error">{error}</span>}
    </div>
  );
};

describe("UserProvider protected /horses route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets error state and null user on API denial", async () => {
    getUserInfo.mockResolvedValue({
      status: "error",
      data: { detail: "Unauthorized" },
    });
    render(
      <UserProvider>
        <Probe />
      </UserProvider>,
    );
    // Should finish loading and show unauthenticated state
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"),
    );
    expect(screen.getByTestId("username")).toHaveTextContent("anonymous");
    expect(screen.getByTestId("error")).toHaveTextContent(
      "Не удалось загрузить информацию о пользователе",
    );
    expect(screen.getByTestId("scopes")).toHaveTextContent("");
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
        scopes: [
          {
            id: "00000000-0000-4000-8000-000000000003" as UUID,
            scope_name: KNOWN_USER_SCOPES.ADMIN,
            scope_description: null,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: null,
          },
        ],
      },
    });
    render(
      <UserProvider>
        <Probe />
      </UserProvider>,
    );
    expect(await screen.findByText("cms-admin")).toBeInTheDocument();
    expect(screen.getByTestId("scopes")).toHaveTextContent("ADMIN");
    expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
  });
});
