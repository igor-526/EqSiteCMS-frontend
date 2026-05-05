import { horseBreedCreate, horseBreedDelete, horseBreedDetail, horseBreedList, horseBreedUpdate } from "@/api/horseBreeds";
import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import { HorseBreedCreateInDto, HorseBreedListQueryParams, HorseBreedOutDto, HorseBreedUpdateInDto } from "@/types/api/horseBreeds";
import { UUID } from "crypto";

export const fetchHorseBreedList = async (
    params: HorseBreedListQueryParams
): Promise<ApiResult<ApiListPaginatedResponseType<HorseBreedOutDto>>> => {
    return await horseBreedList(params);
};

export const fetchHorseBreed = async (
    horseBreedId: UUID,
): Promise<ApiResult<HorseBreedOutDto>> => {
    return await horseBreedDetail(horseBreedId);
};

export const fetchCreateHorseBreed = async (
    data: HorseBreedCreateInDto
): Promise<ApiResult<HorseBreedOutDto>> => {
    return await horseBreedCreate(data);
};

export const fetchUpdateHorseBreed = async (
    horseBreedId: UUID,
    data: HorseBreedUpdateInDto
): Promise<ApiResult<HorseBreedOutDto>> => {
    return await horseBreedUpdate(horseBreedId, data);
};

export const fetchDeleteHorseBreed = async (
    horseBreedId: UUID
): Promise<ApiResult<null>> => {
    return await horseBreedDelete(horseBreedId);
};
