import { horseServiceCreate, horseServiceDelete, horseServiceDetail, horseServiceList, horseServiceUpdate } from "@/api/horseServices";
import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import { HorseServiceCreateInDto, HorseServiceListQueryParams, HorseServiceOutDto, HorseServiceUpdateInDto } from "@/types/api/horseServices";
import { UUID } from "crypto";

export const fetchHorseServiceList = async (
    params: HorseServiceListQueryParams
): Promise<ApiResult<ApiListPaginatedResponseType<HorseServiceOutDto>>> => {
    return await horseServiceList(params);
};

export const fetchHorseService = async (
    horseServiceId: UUID,
): Promise<ApiResult<HorseServiceOutDto>> => {
    return await horseServiceDetail(horseServiceId);
};

export const fetchCreateHorseService = async (
    data: HorseServiceCreateInDto
): Promise<ApiResult<HorseServiceOutDto>> => {
    return await horseServiceCreate(data);
};

export const fetchUpdateHorseService = async (
    horseServiceId: UUID,
    data: HorseServiceUpdateInDto
): Promise<ApiResult<HorseServiceOutDto>> => {
    return await horseServiceUpdate(horseServiceId, data);
};

export const fetchDeleteHorseService = async (
    horseServiceId: UUID
): Promise<ApiResult<null>> => {
    return await horseServiceDelete(horseServiceId);
};
