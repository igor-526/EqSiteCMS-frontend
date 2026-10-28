import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { SEO_ACTIONS, seoScopesRegistry, useSeoScopes } from "./useSeoScopes";

const context = vi.hoisted(() => ({ scopes: [] as KNOWN_USER_SCOPES[] }));
vi.mock("@/contexts/UserContext", () => ({ useUserContext: () => context }));

describe("FT-PR-03 / FT-YX-02 SEO local SEO-only permissions", () => {
  it.each([
    [KNOWN_USER_SCOPES.SEO],
    [KNOWN_USER_SCOPES.SEO, KNOWN_USER_SCOPES.ADMIN],
  ])("allows SEO actions for %s", (...scopes) => {
    context.scopes = scopes;
    const { result } = renderHook(useSeoScopes);
    for (const action of Object.values(SEO_ACTIONS)) {
      expect(seoScopesRegistry[action]).toEqual([KNOWN_USER_SCOPES.SEO]);
      expect(result.current.hasPermission(action)).toBe(true);
    }
  });

  it.each([
    [], [KNOWN_USER_SCOPES.ADMIN], [KNOWN_USER_SCOPES.SUPERUSER], [KNOWN_USER_SCOPES.DEVELOPER],
    [KNOWN_USER_SCOPES.USER_MANAGER], [KNOWN_USER_SCOPES.SUPERUSER, KNOWN_USER_SCOPES.DEVELOPER],
  ])("denies every action without SEO: %j", (...scopes) => {
    context.scopes = scopes;
    const { result } = renderHook(useSeoScopes);
    for (const action of Object.values(SEO_ACTIONS)) {
      expect(result.current.hasPermission(action)).toBe(false);
    }
  });

  it("UT-SEO-05 registers all five data actions and updates guards on permission changes", () => {
    const actions = [SEO_ACTIONS.LIST_PAGES, SEO_ACTIONS.LIST_QUERIES,
      SEO_ACTIONS.LIST_NORMALIZATION, SEO_ACTIONS.CREATE_NORMALIZATION,
      SEO_ACTIONS.DELETE_NORMALIZATION];
    context.scopes = [];
    const { result, rerender } = renderHook(useSeoScopes);
    for (const action of actions) expect(result.current.hasPermission(action)).toBe(false);
    context.scopes = [KNOWN_USER_SCOPES.SEO];
    rerender();
    for (const action of actions) expect(result.current.hasPermission(action)).toBe(true);
    context.scopes = [KNOWN_USER_SCOPES.SUPERUSER, KNOWN_USER_SCOPES.DEVELOPER];
    rerender();
    for (const action of actions) expect(result.current.hasPermission(action)).toBe(false);
  });

  it("updates permission when SEO is revoked", () => {
    context.scopes = [KNOWN_USER_SCOPES.SEO];
    const { result, rerender } = renderHook(useSeoScopes);
    expect(result.current.hasPermission(SEO_ACTIONS.BIND_COUNTER)).toBe(true);
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    rerender();
    expect(result.current.hasPermission(SEO_ACTIONS.BIND_COUNTER)).toBe(false);
  });
});
