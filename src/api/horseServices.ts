import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import apiFetch, { addQueryParamsToUrl } from "./client";
import { UUID } from "crypto";
import { HorseServiceCreateInDto, HorseServiceListQueryParams, HorseServiceOutDto, HorseServiceUpdateInDto } from "@/types/api/horseServices";

export const horseServiceList = (
    params: HorseServiceListQueryParams = {},
    options?: RequestInit,
): Promise<ApiResult<ApiListPaginatedResponseType<HorseServiceOutDto>>> => {
    const paramtrizedUrl = addQueryParamsToUrl("/horses/services", params);
    return apiFetch<ApiListPaginatedResponseType<HorseServiceOutDto>>(paramtrizedUrl, options);
};

export const horseServiceDetail = (
    horseServiceId: UUID,
    params?: { page_data?: boolean },
): Promise<ApiResult<HorseServiceOutDto>> => {
    const paramtrizedUrl = addQueryParamsToUrl(`/horses/services/${horseServiceId}`, params || {});
    return apiFetch<HorseServiceOutDto>(paramtrizedUrl, {
        method: "GET",
    });
};

export const horseServiceCreate = (
    payload: HorseServiceCreateInDto,
): Promise<ApiResult<HorseServiceOutDto>> => {
    return apiFetch<HorseServiceOutDto>("/horses/services", {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

export const horseServiceUpdate = (
    horseServiceId: UUID,
    payload: HorseServiceUpdateInDto,
): Promise<ApiResult<HorseServiceOutDto>> => {
    return apiFetch<HorseServiceOutDto>(`/horses/services/${horseServiceId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
};

export const horseServiceDelete = (
    horseServiceId: UUID,
): Promise<ApiResult<null>> => {
    return apiFetch<null>(`/horses/services/${horseServiceId}`, {
        method: "DELETE",
    });
};