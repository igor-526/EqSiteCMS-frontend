import { siteSettingCreate, siteSettingDelete, siteSettingDetail, siteSettingList, siteSettingUpdate } from "@/api/siteSettings";
import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import { SiteSettingListQueryParams, SiteSettingOutDto, SiteSettingsCreateInDto, SiteSettingsUpdateInDto } from "@/types/api/siteSettings";
import { UUID } from "crypto";

export const fetchSiteSettingList = async (
    params: SiteSettingListQueryParams
): Promise<ApiResult<ApiListPaginatedResponseType<SiteSettingOutDto>>> => {
    return await siteSettingList(params);
};

export const fetchSiteSetting = async (
    siteSettingId: UUID,
): Promise<ApiResult<SiteSettingOutDto>> => {
    return await siteSettingDetail(siteSettingId);
};

export const fetchCreateSiteSetting = async (
    data: SiteSettingsCreateInDto
): Promise<ApiResult<SiteSettingOutDto>> => {
    return await siteSettingCreate(data);
};

export const fetchUpdateSiteSetting = async (
    siteSettingId: UUID,
    data: SiteSettingsUpdateInDto
): Promise<ApiResult<SiteSettingOutDto>> => {
    return await siteSettingUpdate(siteSettingId, data);
};

export const fetchDeleteSiteSetting = async (
    siteSettingId: UUID
): Promise<ApiResult<null>> => {
    return await siteSettingDelete(siteSettingId);
};
