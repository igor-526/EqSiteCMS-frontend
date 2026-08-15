import {
  priceGroupCreate,
  priceGroupDelete,
  priceGroupDetail,
  priceGroupList,
  priceGroupReorder,
  priceGroupUpdate,
} from "@/api/priceGroups";
import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import {
  PriceGroupCreateInDto,
  PriceGroupListQueryParams,
  PriceGroupOutDto,
  PriceGroupReorderInDto,
  PriceGroupUpdateInDto,
} from "@/types/api/priceGroups";
import { UUID } from "crypto";

export const fetchPriceGroupList = async (
  params: PriceGroupListQueryParams,
): Promise<ApiResult<ApiListPaginatedResponseType<PriceGroupOutDto>>> => {
  return await priceGroupList(params);
};

export const fetchPriceGroup = async (
  groupId: UUID,
): Promise<ApiResult<PriceGroupOutDto>> => {
  return await priceGroupDetail(groupId);
};

export const fetchCreatePriceGroup = async (
  data: PriceGroupCreateInDto,
): Promise<ApiResult<PriceGroupOutDto>> => {
  return await priceGroupCreate(data);
};

export const fetchUpdatePriceGroup = async (
  groupId: UUID,
  data: PriceGroupUpdateInDto,
): Promise<ApiResult<PriceGroupOutDto>> => {
  return await priceGroupUpdate(groupId, data);
};

export const fetchDeletePriceGroup = async (
  groupId: UUID,
): Promise<ApiResult<null>> => {
  return await priceGroupDelete(groupId);
};

export const fetchReorderPricesInGroup = async (
  priceGroupId: string,
  payload: PriceGroupReorderInDto,
): Promise<ApiResult<null>> => {
  return await priceGroupReorder(priceGroupId, payload);
};
