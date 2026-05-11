import React from "react";
import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import {
  PRICE_PAGE_SCOPES_ACTIONS,
  usePricePageActionScopes,
} from "@/features/prices/hooks/usePriceScopes";
import {
  NEWS_PAGE_SCOPES_ACTIONS,
  useNewsPageActionScopes,
} from "@/features/news/hooks/useNewsScopes";

const userContextState = vi.hoisted(() => ({
  scopes: [] as KNOWN_USER_SCOPES[],
  user: null as null | { username: string },
  loading: false,
}));

vi.mock("@/contexts/UserContext", () => ({
  useUserContext: () => ({
    user: userContextState.user,
    loading: userContextState.loading,
    error: null,
    scopes: userContextState.scopes,
    refreshUser: vi.fn(),
    clearUser: vi.fn(),
  }),
}));

const PriceCreateAction = () => {
  const { hasPermission } = usePricePageActionScopes();
  return hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_GROUP_CREATE) ? (
    <button type="button">Create price group</button>
  ) : (
    <button type="button" disabled>
      Create price group
    </button>
  );
};

describe("CMS scopes helpers", () => {
  beforeEach(() => {
    userContextState.scopes = [];
    userContextState.user = null;
    userContextState.loading = false;
  });

  it("reports anonymous users as missing protected admin action scopes", () => {
    const { result } = renderHook(() => usePricePageActionScopes());

    expect(result.current.hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_CREATE)).toBe(false);
  });

  it("allows price protected write actions when an admin scope is present", () => {
    userContextState.user = { username: "admin" };
    userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];

    const { result } = renderHook(() => usePricePageActionScopes());

    expect(result.current.hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_CREATE)).toBe(true);
  });

  it("rejects developer-only price group creation for admin-only users", () => {
    userContextState.user = { username: "admin" };
    userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];

    const { result } = renderHook(() => usePricePageActionScopes());

    expect(result.current.hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_GROUP_CREATE)).toBe(false);
  });

  it("allows news developer docs only for developer or superuser scopes", () => {
    userContextState.scopes = [KNOWN_USER_SCOPES.DEVELOPER];

    const { result } = renderHook(() => useNewsPageActionScopes());

    expect(result.current.hasPermission(NEWS_PAGE_SCOPES_ACTIONS.SEE_DEVELOPER_DOCS)).toBe(true);
    expect(result.current.hasPermission(NEWS_PAGE_SCOPES_ACTIONS.SEE_ADMIN_INSTRUCTIONS)).toBe(false);
  });

  it("renders a protected write action enabled when scope is present", () => {
    userContextState.scopes = [KNOWN_USER_SCOPES.DEVELOPER];

    render(<PriceCreateAction />);

    expect(screen.getByRole("button", { name: "Create price group" })).toBeEnabled();
  });

  it("renders a protected write action disabled when scope is missing", () => {
    userContextState.scopes = [KNOWN_USER_SCOPES.ADMIN];

    render(<PriceCreateAction />);

    expect(screen.getByRole("button", { name: "Create price group" })).toBeDisabled();
  });
});
