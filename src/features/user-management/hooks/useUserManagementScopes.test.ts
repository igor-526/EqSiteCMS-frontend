import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { useCanAccessUserManagement } from "./useUserManagementScopes";

const context = vi.hoisted(() => ({ scopes: [] as KNOWN_USER_SCOPES[] }));
vi.mock("@/contexts/UserContext", () => ({
  useUserContext: () => ({ scopes: context.scopes, user: null }),
}));

describe("user-management protected access", () => {
  beforeEach(() => { context.scopes = []; });

  it("blocks anonymous and authenticated users without required role", () => {
    expect(renderHook(() => useCanAccessUserManagement()).result.current).toBe(false);
    context.scopes = [KNOWN_USER_SCOPES.ADMIN];
    expect(renderHook(() => useCanAccessUserManagement()).result.current).toBe(false);
  });

  it.each([KNOWN_USER_SCOPES.USER_MANAGER, KNOWN_USER_SCOPES.SUPERUSER])("allows %s", (scope) => {
    context.scopes = [scope];
    expect(renderHook(() => useCanAccessUserManagement()).result.current).toBe(true);
  });
});
