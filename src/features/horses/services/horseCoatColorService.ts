import { horseCoatColorCreate, horseCoatColorDelete, horseCoatColorDetail, horseCoatColorList, horseCoatColorUpdate } from "@/api/horseCoatColor";
import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import { HorseCoatColorCreateInDto, HorseCoatColorListQueryParams, HorseCoatColorOutDto, HorseCoatColorUpdateInDto } from "@/types/api/horseCoatColor";
import { UUID } from "crypto";

export const fetchHorseCoatColorList = async (
    params: HorseCoatColorListQueryParams
): Promise<ApiResult<ApiListPaginatedResponseType<HorseCoatColorOutDto>>> => {
    return await horseCoatColorList(params);
};

export const fetchHorseCoatColor = async (
    horseCoatColorId: UUID,
): Promise<ApiResult<HorseCoatColorOutDto>> => {
    return await horseCoatColorDetail(horseCoatColorId);
};

export const fetchCreateHorseCoatColor = async (
    data: HorseCoatColorCreateInDto
): Promise<ApiResult<HorseCoatColorOutDto>> => {
    return await horseCoatColorCreate(data);
};

export const fetchUpdateHorseCoatColor = async (
    horseCoatColorId: UUID,
    data: HorseCoatColorUpdateInDto
): Promise<ApiResult<HorseCoatColorOutDto>> => {
    return await horseCoatColorUpdate(horseCoatColorId, data);
};

export const fetchDeleteHorseCoatColor = async (
    horseCoatColorId: UUID
): Promise<ApiResult<null>> => {
    return await horseCoatColorDelete(horseCoatColorId);
};
