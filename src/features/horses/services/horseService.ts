import { horseCreate, horseDelete, horseList, horsePhotosUpdate, horseUpdate } from "@/api/horses";
import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import {
    HorseCreateInDto,
    HorseListQueryParams,
    HorseOutDto,
    HorseUpdateInDto,
    HorseWithPedigreeOutDto,
} from "@/types/api/horses";
import { PhotoUpdateEntityInDto } from "@/types/api/photos";
import { UUID } from "crypto";

export const fetchHorseList = async (
    params: HorseListQueryParams,
): Promise<ApiResult<ApiListPaginatedResponseType<HorseOutDto | HorseWithPedigreeOutDto>>> => {
    return await horseList(params);
};

export const fetchCreateHorse = async (
    data: HorseCreateInDto,
): Promise<ApiResult<HorseOutDto>> => {
    return await horseCreate(data);
};

export const fetchUpdateHorse = async (
    id: UUID,
    data: HorseUpdateInDto,
): Promise<ApiResult<HorseOutDto>> => {
    return await horseUpdate(id, data);
};

export const fetchDeleteHorse = async (
    id: UUID,
): Promise<ApiResult<null>> => {
    return await horseDelete(id);
};

export const fetchUpdateHorsePhotos = async (
    id: UUID,
    data: PhotoUpdateEntityInDto,
): Promise<ApiResult<null>> => {
    return await horsePhotosUpdate(id, data);
};
