import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import apiFetch, { addQueryParamsToUrl } from "./client";
import { UUID } from "crypto";
import { HorseBreedCreateInDto, HorseBreedListQueryParams, HorseBreedOutDto, HorseBreedUpdateInDto } from "@/types/api/horseBreeds";

export const horseBreedList = (
    params: HorseBreedListQueryParams = {},
    options?: RequestInit,
): Promise<ApiResult<ApiListPaginatedResponseType<HorseBreedOutDto>>> => {
    const paramtrizedUrl = addQueryParamsToUrl("/horses/breeds", params);
    return apiFetch<ApiListPaginatedResponseType<HorseBreedOutDto>>(paramtrizedUrl, options);
};

export const horseBreedDetail = (
    horseBreedId: UUID,
    params?: { page_data?: boolean },
): Promise<ApiResult<HorseBreedOutDto>> => {
    const paramtrizedUrl = addQueryParamsToUrl(`/horses/breeds/${horseBreedId}`, params || {});
    return apiFetch<HorseBreedOutDto>(paramtrizedUrl, {
        method: "GET",
    });
};

export const horseBreedCreate = (
    payload: HorseBreedCreateInDto,
): Promise<ApiResult<HorseBreedOutDto>> => {
    return apiFetch<HorseBreedOutDto>("/horses/breeds", {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

export const horseBreedUpdate = (
    horseBreedId: UUID,
    payload: HorseBreedUpdateInDto,
): Promise<ApiResult<HorseBreedOutDto>> => {
    return apiFetch<HorseBreedOutDto>(`/horses/breeds/${horseBreedId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
};

export const horseBreedDelete = (
    horseBreedId: UUID,
): Promise<ApiResult<null>> => {
    return apiFetch<null>(`/horses/breeds/${horseBreedId}`, {
        method: "DELETE",
    });
};