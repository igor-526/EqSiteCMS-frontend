import apiFetch, { addQueryParamsToUrl } from "./client";
import type { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import type {
  HorseBreedGroupCreateInDto,
  HorseBreedGroupDetailQueryParams,
  HorseBreedGroupListQueryParams,
  HorseBreedGroupOutDto,
  HorseBreedGroupUpdateInDto,
} from "@/types/api/horseBreedGroups";

const ROOT = "/horses/breed-groups";

export const horseBreedGroupList = (params: HorseBreedGroupListQueryParams = {}) =>
  apiFetch<ApiListPaginatedResponseType<HorseBreedGroupOutDto>>(
    addQueryParamsToUrl(ROOT, params),
  );

export const horseBreedGroupDetail = (
  id: string,
  params: HorseBreedGroupDetailQueryParams = {},
) => apiFetch<HorseBreedGroupOutDto>(addQueryParamsToUrl(`${ROOT}/${id}`, params));

export const horseBreedGroupCreate = (payload: HorseBreedGroupCreateInDto) =>
  apiFetch<HorseBreedGroupOutDto>(ROOT, { method: "POST", body: JSON.stringify(payload) });

export const horseBreedGroupUpdate = (id: string, payload: HorseBreedGroupUpdateInDto) =>
  apiFetch<HorseBreedGroupOutDto>(`${ROOT}/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const horseBreedGroupDelete = (id: string): Promise<ApiResult<null>> =>
  apiFetch<null>(`${ROOT}/${id}`, { method: "DELETE" });
