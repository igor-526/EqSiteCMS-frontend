import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import apiFetch, { addQueryParamsToUrl } from "./client";
import { UUID } from "crypto";
import {
    HorseCreateInDto,
    HorseListQueryParams,
    HorseOutDto,
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
    options?: RequestInit,
): Promise<ApiResult<HorseOutDto | HorseWithPedigreeOutDto>> => {
    return apiFetch<HorseOutDto | HorseWithPedigreeOutDto>(`/horses/${idOrSlug}`, options);
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
): Promise<ApiResult<null>> => {
    return apiFetch<null>(`/horses/${id}/photos`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
};
