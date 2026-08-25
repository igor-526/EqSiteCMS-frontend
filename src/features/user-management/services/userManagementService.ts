import {
  userManagementList,
  userManagementGet,
  userManagementCreate,
  userManagementUpdate,
  userManagementDelete,
  userManagementBlock,
  userManagementUnblock,
  userManagementChangePassword,
  userManagementRolesList,
} from "@/api/userManagement";
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

export const fetchUserManagementList = (
  params: UserManagementListQueryParams,
): Promise<ApiResult<ApiListPaginatedResponseType<UserManagementOutDto>>> => {
  return userManagementList(params);
};

export const fetchUserManagementGet = (
  id: UUID,
): Promise<ApiResult<UserManagementOutDto>> => {
  return userManagementGet(id);
};

export const fetchUserManagementCreate = (
  data: UserManagementCreateInDto,
): Promise<ApiResult<UserManagementOutDto>> => {
  return userManagementCreate(data);
};

export const fetchUserManagementUpdate = (
  id: UUID,
  data: UserManagementUpdateInDto,
): Promise<ApiResult<UserManagementOutDto>> => {
  return userManagementUpdate(id, data);
};

export const fetchUserManagementDelete = (
  id: UUID,
): Promise<ApiResult<null>> => {
  return userManagementDelete(id);
};

export const fetchUserManagementBlock = (
  id: UUID,
): Promise<ApiResult<UserManagementOutDto>> => {
  return userManagementBlock(id);
};

export const fetchUserManagementUnblock = (
  id: UUID,
): Promise<ApiResult<UserManagementOutDto>> => {
  return userManagementUnblock(id);
};

export const fetchUserManagementChangePassword = (
  id: UUID,
  data: UserManagementChangePasswordInDto,
): Promise<ApiResult<null>> => {
  return userManagementChangePassword(id, data);
};

export const fetchRolesList = (
  params: RoleListQueryParams = {},
): Promise<ApiResult<UserManagementRoleOutDto[]>> => {
  return userManagementRolesList(params);
};
