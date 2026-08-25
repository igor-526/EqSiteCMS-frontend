import apiFetch, { addQueryParamsToUrl } from "./client";
import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import { UUID } from "crypto";
import {
  UserManagementOutDto,
  UserManagementCreateInDto,
  UserManagementUpdateInDto,
  UserManagementChangePasswordInDto,
  UserManagementListQueryParams,
  UserManagementRoleOutDto,
  RoleListQueryParams,
} from "@/types/api/userManagement";

const BASE = "/user-management";

export const userManagementList = (
  params: UserManagementListQueryParams = {},
  options?: RequestInit,
): Promise<ApiResult<ApiListPaginatedResponseType<UserManagementOutDto>>> => {
  const url = addQueryParamsToUrl(`${BASE}/users`, params);
  return apiFetch<ApiListPaginatedResponseType<UserManagementOutDto>>(
    url,
    options,
  );
};

export const userManagementGet = (
  id: UUID,
  options?: RequestInit,
): Promise<ApiResult<UserManagementOutDto>> => {
  return apiFetch<UserManagementOutDto>(`${BASE}/users/${id}`, options);
};

export const userManagementCreate = (
  payload: UserManagementCreateInDto,
): Promise<ApiResult<UserManagementOutDto>> => {
  return apiFetch<UserManagementOutDto>(`${BASE}/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const userManagementUpdate = (
  id: UUID,
  payload: UserManagementUpdateInDto,
): Promise<ApiResult<UserManagementOutDto>> => {
  return apiFetch<UserManagementOutDto>(`${BASE}/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const userManagementDelete = (id: UUID): Promise<ApiResult<null>> => {
  return apiFetch<null>(`${BASE}/users/${id}`, {
    method: "DELETE",
  });
};

export const userManagementBlock = (
  id: UUID,
): Promise<ApiResult<UserManagementOutDto>> => {
  return apiFetch<UserManagementOutDto>(`${BASE}/users/${id}/block`, {
    method: "PATCH",
  });
};

export const userManagementUnblock = (
  id: UUID,
): Promise<ApiResult<UserManagementOutDto>> => {
  return apiFetch<UserManagementOutDto>(`${BASE}/users/${id}/unblock`, {
    method: "PATCH",
  });
};

export const userManagementChangePassword = (
  id: UUID,
  payload: UserManagementChangePasswordInDto,
): Promise<ApiResult<null>> => {
  return apiFetch<null>(`${BASE}/users/${id}/password`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const userManagementRolesList = (
  params: RoleListQueryParams = {},
  options?: RequestInit,
): Promise<ApiResult<UserManagementRoleOutDto[]>> => {
  const url = addQueryParamsToUrl(`${BASE}/roles`, params);
  return apiFetch<UserManagementRoleOutDto[]>(url, options);
};
