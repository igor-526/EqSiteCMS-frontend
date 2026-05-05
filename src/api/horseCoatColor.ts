import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import apiFetch, { addQueryParamsToUrl } from "./client";
import { UUID } from "crypto";
import { HorseCoatColorCreateInDto, HorseCoatColorListQueryParams, HorseCoatColorOutDto, HorseCoatColorUpdateInDto } from "@/types/api/horseCoatColor";

export const horseCoatColorList = (
    params: HorseCoatColorListQueryParams = {},
    options?: RequestInit,
): Promise<ApiResult<ApiListPaginatedResponseType<HorseCoatColorOutDto>>> => {
    const paramtrizedUrl = addQueryParamsToUrl("/horses/coat_colors", params);
    return apiFetch<ApiListPaginatedResponseType<HorseCoatColorOutDto>>(paramtrizedUrl, options);
};

export const horseCoatColorDetail = (
    horseCoatColorId: UUID,
    params?: { page_data?: boolean },
): Promise<ApiResult<HorseCoatColorOutDto>> => {
    const paramtrizedUrl = addQueryParamsToUrl(`/horses/coat_colors/${horseCoatColorId}`, params || {});
    return apiFetch<HorseCoatColorOutDto>(paramtrizedUrl, {
        method: "GET",
    });
};

export const horseCoatColorCreate = (
    payload: HorseCoatColorCreateInDto,
): Promise<ApiResult<HorseCoatColorOutDto>> => {
    return apiFetch<HorseCoatColorOutDto>("/horses/coat_colors", {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

export const horseCoatColorUpdate = (
    horseCoatColorId: UUID,
    payload: HorseCoatColorUpdateInDto,
): Promise<ApiResult<HorseCoatColorOutDto>> => {
    return apiFetch<HorseCoatColorOutDto>(`/horses/coat_colors/${horseCoatColorId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
};

export const horseCoatColorDelete = (
    horseCoatColorId: UUID,
): Promise<ApiResult<null>> => {
    return apiFetch<null>(`/horses/coat_colors/${horseCoatColorId}`, {
        method: "DELETE",
    });
};