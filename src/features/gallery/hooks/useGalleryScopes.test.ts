import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { GALLERY_ACTIONS, useGalleryScopes } from "./useGalleryScopes";

const state = vi.hoisted(() => ({ scopes: [] as KNOWN_USER_SCOPES[] }));

vi.mock("@/contexts/UserContext", () => ({
  useUserContext: () => ({ scopes: state.scopes }),
}));

describe("useGalleryScopes", () => {
  beforeEach(() => {
    state.scopes = [];
  });

  it.each([
    KNOWN_USER_SCOPES.SUPERUSER,
    KNOWN_USER_SCOPES.ADMIN,
    KNOWN_USER_SCOPES.DEVELOPER,
  ])("permits upload and remove for %s", (scope) => {
    state.scopes = [scope];
    const { result } = renderHook(() => useGalleryScopes());
    expect(result.current.hasPermission(GALLERY_ACTIONS.UPLOAD)).toBe(true);
    expect(result.current.hasPermission(GALLERY_ACTIONS.REMOVE)).toBe(true);
  });

  it("denies mutations when required scope is missing", () => {
    state.scopes = [KNOWN_USER_SCOPES.USER_MANAGER];
    const { result } = renderHook(() => useGalleryScopes());
    expect(result.current.hasPermission(GALLERY_ACTIONS.UPLOAD)).toBe(false);
    expect(result.current.hasPermission(GALLERY_ACTIONS.REMOVE)).toBe(false);
  });
});
