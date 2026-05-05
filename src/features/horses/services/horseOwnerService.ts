import { horseOwnerCreate, horseOwnerDelete, horseOwnerDetail, horseOwnerList, horseOwnerUpdate } from "@/api/horseOwners";
import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import { HorseOwnerCreateInDto, HorseOwnerListQueryParams, HorseOwnerOutDto, HorseOwnerUpdateInDto } from "@/types/api/horseOwners";
import { UUID } from "crypto";

export const fetchHorseOwnerList = async (
    params: HorseOwnerListQueryParams
): Promise<ApiResult<ApiListPaginatedResponseType<HorseOwnerOutDto>>> => {
    return await horseOwnerList(params);
};

export const fetchHorseOwner = async (
    horseOwnerId: UUID,
): Promise<ApiResult<HorseOwnerOutDto>> => {
    return await horseOwnerDetail(horseOwnerId);
};

export const fetchCreateHorseOwner = async (
    data: HorseOwnerCreateInDto
): Promise<ApiResult<HorseOwnerOutDto>> => {
    return await horseOwnerCreate(data);
};

export const fetchUpdateHorseOwner = async (
    horseOwnerId: UUID,
    data: HorseOwnerUpdateInDto
): Promise<ApiResult<HorseOwnerOutDto>> => {
    return await horseOwnerUpdate(horseOwnerId, data);
};

export const fetchDeleteHorseOwner = async (
    horseOwnerId: UUID
): Promise<ApiResult<null>> => {
    return await horseOwnerDelete(horseOwnerId);
};
