import { describe, expect, it } from "vitest";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { hasCallbackRequestAccess } from "./useCallbackRequestAccess";

describe("callback request route access", () => {
  it.each([KNOWN_USER_SCOPES.ADMIN, KNOWN_USER_SCOPES.SUPERUSER])("allows %s", (scope) => expect(hasCallbackRequestAccess([scope])).toBe(true));
  it.each([KNOWN_USER_SCOPES.DEVELOPER, KNOWN_USER_SCOPES.USER_MANAGER])("forbids %s", (scope) => expect(hasCallbackRequestAccess([scope])).toBe(false));
});
