import { KNOWN_USER_SCOPES, type User } from "@/types/api/user";
import type { UUID } from "crypto";

const uuid = (suffix: string) => `00000000-0000-4000-8000-${suffix}` as UUID;

export const userScope = (scopeName: KNOWN_USER_SCOPES) => ({
  id: uuid(
    scopeName === KNOWN_USER_SCOPES.ADMIN ? "000000000001" : "000000000002",
  ),
  scope_name: scopeName,
  scope_description: null,
  created_at: "2026-05-11T00:00:00.000Z",
  updated_at: null,
});

export const cmsUser = (
  scopes: KNOWN_USER_SCOPES[] = [KNOWN_USER_SCOPES.ADMIN],
): User => ({
  id: uuid("000000000010"),
  equestrian_id: uuid("000000000011"),
  username: "cms-admin",
  first_name: "Cms",
  last_name: "Admin",
  middle_name: null,
  created_at: "2026-05-11T00:00:00.000Z",
  updated_at: null,
  scopes: scopes.map(userScope),
});
