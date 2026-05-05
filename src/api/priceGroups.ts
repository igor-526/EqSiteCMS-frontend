import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import apiFetch, { addQueryParamsToUrl } from "./client";
import { PriceGroupCreateInDto, PriceGroupListQueryParams, PriceGroupOutDto, PriceGroupUpdateInDto } from "@/types/api/priceGroups";
import { UUID } from "crypto";

export const priceGroupList = (
    params: PriceGroupListQueryParams = {},
    options?: RequestInit,
): Promise<ApiResult<ApiListPaginatedResponseType<PriceGroupOutDto>>> => {
    const paramtrizedUrl = addQueryParamsToUrl("/prices/groups", params);
    return apiFetch<ApiListPaginatedResponseType<PriceGroupOutDto>>(paramtrizedUrl, options);
};

export const priceGroupDetail = (
    priceGroupId: UUID,
): Promise<ApiResult<PriceGroupOutDto>> => {
    return apiFetch<PriceGroupOutDto>(`/prices/groups/${priceGroupId}`, {
        method: "GET",
    });
};

export const priceGroupCreate = (
    payload: PriceGroupCreateInDto,
): Promise<ApiResult<PriceGroupOutDto>> => {
    return apiFetch<PriceGroupOutDto>("/prices/groups", {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

export const priceGroupUpdate = (
    priceGroupId: UUID,
    payload: PriceGroupUpdateInDto,
): Promise<ApiResult<PriceGroupOutDto>> => {
    return apiFetch<PriceGroupOutDto>(`/prices/groups/${priceGroupId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
};

export const priceGroupDelete = (
    priceGroupId: UUID,
): Promise<ApiResult<null>> => {
    return apiFetch<null>(`/prices/groups/${priceGroupId}`, {
        method: "DELETE",
    });
};