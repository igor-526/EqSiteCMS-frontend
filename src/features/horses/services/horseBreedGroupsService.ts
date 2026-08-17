import {
  horseBreedGroupCreate,
  horseBreedGroupDelete,
  horseBreedGroupDetail,
  horseBreedGroupList,
  horseBreedGroupUpdate,
} from "@/api/horseBreedGroups";
import type {
  HorseBreedGroupCreateInDto,
  HorseBreedGroupDetailQueryParams,
  HorseBreedGroupListQueryParams,
  HorseBreedGroupUpdateInDto,
} from "@/types/api/horseBreedGroups";

export const fetchHorseBreedGroupList = (params: HorseBreedGroupListQueryParams) =>
  horseBreedGroupList(params);
export const fetchHorseBreedGroup = (id: string, params?: HorseBreedGroupDetailQueryParams) =>
  horseBreedGroupDetail(id, params);
export const fetchCreateHorseBreedGroup = (data: HorseBreedGroupCreateInDto) =>
  horseBreedGroupCreate(data);
export const fetchUpdateHorseBreedGroup = (id: string, data: HorseBreedGroupUpdateInDto) =>
  horseBreedGroupUpdate(id, data);
export const fetchDeleteHorseBreedGroup = (id: string) => horseBreedGroupDelete(id);
