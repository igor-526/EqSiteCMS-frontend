import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import apiFetch, { addQueryParamsToUrl } from "./client";
import { UUID } from "crypto";
import { HorseOwnerCreateInDto, HorseOwnerListQueryParams, HorseOwnerOutDto, HorseOwnerUpdateInDto } from "@/types/api/horseOwners";

export const horseOwnerList = (
    params: HorseOwnerListQueryParams = {},
    options?: RequestInit,
): Promise<ApiResult<ApiListPaginatedResponseType<HorseOwnerOutDto>>> => {
    const paramtrizedUrl = addQueryParamsToUrl("/horses/owners", params);
    return apiFetch<ApiListPaginatedResponseType<HorseOwnerOutDto>>(paramtrizedUrl, options);
};

export const horseOwnerDetail = (
    horseOwnerId: UUID,
): Promise<ApiResult<HorseOwnerOutDto>> => {
    return apiFetch<HorseOwnerOutDto>(`/horses/owners/${horseOwnerId}`, {
        method: "GET",
    });
};

export const horseOwnerCreate = (
    payload: HorseOwnerCreateInDto,
): Promise<ApiResult<HorseOwnerOutDto>> => {
    return apiFetch<HorseOwnerOutDto>("/horses/owners", {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

export const horseOwnerUpdate = (
    horseOwnerId: UUID,
    payload: HorseOwnerUpdateInDto,
): Promise<ApiResult<HorseOwnerOutDto>> => {
    return apiFetch<HorseOwnerOutDto>(`/horses/owners/${horseOwnerId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
};

export const horseOwnerDelete = (
    horseOwnerId: UUID,
): Promise<ApiResult<null>> => {
    return apiFetch<null>(`/horses/owners/${horseOwnerId}`, {
        method: "DELETE",
    });
};