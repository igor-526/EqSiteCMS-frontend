import { UUID } from "crypto";
import { ApiPaginationType } from "./api";

// ─── Out DTOs ───────────────────────────────────────────────────

export type UserManagementRoleOutDto = {
  id: UUID;
  scope_name: string;
  scope_description: string | null;
};

export type UserManagementOutDto = {
  id: UUID;
  username: string;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  is_blocked: boolean;
  created_at: string;
  updated_at: string | null;
  scopes: UserManagementRoleOutDto[];
};

// ─── In DTOs ────────────────────────────────────────────────────

export type UserManagementCreateInDto = {
  username: string;
  password: string;
  confirm_password: string;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  scope_ids: UUID[];
};

export type UserManagementUpdateInDto = {
  first_name?: string | null;
  last_name?: string | null;
  middle_name?: string | null;
  scope_ids?: UUID[];
};

export type UserManagementChangePasswordInDto = {
  new_password: string;
  confirm_password: string;
};

// ─── Query params ───────────────────────────────────────────────

export type UserManagementSorting =
  | "username"
  | "-username"
  | "last_name"
  | "-last_name"
  | "first_name"
  | "-first_name"
  | "middle_name"
  | "-middle_name"
  | "is_blocked"
  | "-is_blocked"
  | "created_at"
  | "-created_at";

export type UserManagementListQueryParams = ApiPaginationType & {
  sort?: UserManagementSorting[];
  search?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  is_blocked?: boolean;
  scope_ids?: UUID[];
};

export type RoleListQueryParams = ApiPaginationType & {
  scope_name?: string;
};
