import {
    horseServiceRelationCreate,
    horseServiceRelationDelete,
    horseServiceRelationList,
    horseServiceRelationUpdate,
    horseServiceRelationAvailableServices,
} from "@/api/horseServiceRelations";
import { ApiResult } from "@/types/api/api";
import {
    HorseServiceRelationAvailableServiceDto,
    HorseServiceRelationAvailableServicesQueryParams,
    HorseServiceRelationCreateInDto,
    HorseServiceRelationOutDto,
    HorseServiceRelationUpdateInDto,
} from "@/types/api/horseServiceRelations";
import { UUID } from "crypto";

export const fetchHorseServiceRelations = async (
    horseId: UUID,
): Promise<ApiResult<HorseServiceRelationOutDto[]>> => {
    return await horseServiceRelationList(horseId);
};

export const fetchCreateHorseServiceRelation = async (
    horseId: UUID,
    data: HorseServiceRelationCreateInDto,
): Promise<ApiResult<HorseServiceRelationOutDto>> => {
    return await horseServiceRelationCreate(horseId, data);
};

export const fetchUpdateHorseServiceRelation = async (
    horseId: UUID,
    relationId: UUID,
    data: HorseServiceRelationUpdateInDto,
): Promise<ApiResult<HorseServiceRelationOutDto>> => {
    return await horseServiceRelationUpdate(horseId, relationId, data);
};

export const fetchDeleteHorseServiceRelation = async (
    horseId: UUID,
    relationId: UUID,
): Promise<ApiResult<null>> => {
    return await horseServiceRelationDelete(horseId, relationId);
};

export const fetchAvailableServices = async (
    horseId: UUID,
    params: HorseServiceRelationAvailableServicesQueryParams = {},
): Promise<ApiResult<HorseServiceRelationAvailableServiceDto[]>> => {
    return await horseServiceRelationAvailableServices(horseId, params);
};
