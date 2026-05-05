import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import apiFetch, { addQueryParamsToUrl } from "./client";
import { UUID } from "crypto";
import { SiteSettingListQueryParams, SiteSettingOutDto, SiteSettingsCreateInDto, SiteSettingsUpdateInDto } from "@/types/api/siteSettings";

export const siteSettingList = (
    params: SiteSettingListQueryParams = {},
    options?: RequestInit,
): Promise<ApiResult<ApiListPaginatedResponseType<SiteSettingOutDto>>> => {
    const paramtrizedUrl = addQueryParamsToUrl("/site_settings", params);
    return apiFetch<ApiListPaginatedResponseType<SiteSettingOutDto>>(paramtrizedUrl, options);
};

export const siteSettingDetail = (
    siteSettingId: UUID,
): Promise<ApiResult<SiteSettingOutDto>> => {
    return apiFetch<SiteSettingOutDto>(`/site_settings/${siteSettingId}`, {
        method: "GET",
    });
};

export const siteSettingCreate = (
    payload: SiteSettingsCreateInDto,
): Promise<ApiResult<SiteSettingOutDto>> => {
    return apiFetch<SiteSettingOutDto>("/site_settings", {
        method: "POST",
        body: JSON.stringify(payload),
    });
};

export const siteSettingUpdate = (
    siteSettingId: UUID,
    payload: SiteSettingsUpdateInDto,
): Promise<ApiResult<SiteSettingOutDto>> => {
    return apiFetch<SiteSettingOutDto>(`/site_settings/${siteSettingId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
};

export const siteSettingDelete = (
    siteSettingId: UUID,
): Promise<ApiResult<null>> => {
    return apiFetch<null>(`/site_settings/${siteSettingId}`, {
        method: "DELETE",
    });
};