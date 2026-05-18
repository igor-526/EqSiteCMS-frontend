import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import apiFetch, { addQueryParamsToUrl } from "./client";
import { UUID } from "crypto";
import {
    HorseCreateInDto,
    HorseAvailablePedigreeQueryParams,
    HorseGetQueryParams,
    HorseListQueryParams,
    HorseOutDto,
    HorsePedigreeMode,
    HorseSetPedigreeInDto,
    HorseUpdateInDto,
    HorseWithPedigreeOutDto,
} from "@/types/api/horses";
import { PhotoUpdateEntityInDto } from "@/types/api/photos";

export const horseList = (
    params: HorseListQueryParams = {},
    options?: RequestInit,
): Promise<ApiResult<ApiListPaginatedResponseType<HorseOutDto | HorseWithPedigreeOutDto>>> => {
    const paramtrizedUrl = addQueryParamsToUrl("/horses", params);
    return apiFetch<ApiListPaginatedResponseType<HorseOutDto | HorseWithPedigreeOutDto>>(
        paramtrizedUrl,
        options,
    );
};

export const horseGet = (
    idOrSlug: string,
    params: HorseGetQueryParams = {},
    options?: RequestInit,
): Promise<ApiResult<HorseOutDto | HorseWithPedigreeOutDto>> => {
    const paramtrizedUrl = addQueryParamsToUrl(`/horses/${idOrSlug}`, params);
    return apiFetch<HorseOutDto | HorseWithPedigreeOutDto>(paramtrizedUrl, options);
};

export const horseAvailablePedigree = (
    id: UUID,
    mode: HorsePedigreeMode,
    params: HorseAvailablePedigreeQueryParams = {},
    options?: RequestInit,
): Promise<ApiResult<ApiListPaginatedResponseType<HorseOutDto>>> => {
    const paramtrizedUrl = addQueryParamsToUrl(`/horses/${id}/pedigree/${mode}`, params);
    return apiFetch<ApiListPaginatedResponseType<HorseOutDto>>(paramtrizedUrl, options);
};

export const horseCreate = (
    payload: HorseCreateInDto,
): Promise<ApiResult<HorseOutDto>> => {
    return apiFetch<HorseOutDto>("/horses", {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

export const horseUpdate = (
    id: UUID,
    payload: HorseUpdateInDto,
): Promise<ApiResult<HorseOutDto>> => {
    return apiFetch<HorseOutDto>(`/horses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
};

export const horseDelete = (
    id: UUID,
): Promise<ApiResult<null>> => {
    return apiFetch<null>(`/horses/${id}`, {
        method: "DELETE",
    });
};

export const horsePhotosUpdate = (
    id: UUID,
    payload: PhotoUpdateEntityInDto,
): Promise<ApiResult<HorseOutDto>> => {
    return apiFetch<HorseOutDto>(`/horses/${id}/photos`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

export const horseSetPedigree = (
    id: UUID,
    payload: HorseSetPedigreeInDto,
): Promise<ApiResult<null>> => {
    return apiFetch<null>(`/horses/${id}/pedigree`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
};
