import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { SEO_ACTIONS, seoScopesRegistry, useSeoScopes } from "./useSeoScopes";

const context = vi.hoisted(() => ({ scopes: [] as KNOWN_USER_SCOPES[] }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));

describe("FT-YX-02 SEO local ADMIN-only permissions", () => {
  it.each([
    [KNOWN_USER_SCOPES.ADMIN],
    [KNOWN_USER_SCOPES.ADMIN, KNOWN_USER_SCOPES.SUPERUSER],
  ])("allows ADMIN actions for %s", (...scopes) => {
    context.scopes = scopes;
    const { result } = renderHook(useSeoScopes);
    for (const action of Object.values(SEO_ACTIONS)) {
      expect(seoScopesRegistry[action]).toEqual([KNOWN_USER_SCOPES.ADMIN]);
      expect(result.current.hasPermission(action)).toBe(true);
    }
  });

  it.each([
    [], [KNOWN_USER_SCOPES.SUPERUSER], [KNOWN_USER_SCOPES.DEVELOPER],
    [KNOWN_USER_SCOPES.USER_MANAGER], [KNOWN_USER_SCOPES.SUPERUSER, KNOWN_USER_SCOPES.DEVELOPER],
  ])("denies every action without ADMIN: %j", (...scopes) => {
    context.scopes = scopes;
    const { result } = renderHook(useSeoScopes);
    for (const action of Object.values(SEO_ACTIONS)) {
      expect(result.current.hasPermission(action)).toBe(false);
    }
  });

  it("updates permission when ADMIN is revoked", () => {
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    const { result, rerender } = renderHook(useSeoScopes);
    expect(result.current.hasPermission(SEO_ACTIONS.BIND_COUNTER)).toBe(true);
    context.scopes = [KNOWN_USER_SCOPES.SUPERUSER];
    rerender();
    expect(result.current.hasPermission(SEO_ACTIONS.BIND_COUNTER)).toBe(false);
  });
});
