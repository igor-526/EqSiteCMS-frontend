import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import apiFetch, { addQueryParamsToUrl } from "./client";
import { UUID } from "crypto";
import {
  HorseServiceRelationAvailableServiceDto,
  HorseServiceRelationAvailableServicesQueryParams,
  HorseServiceRelationCreateInDto,
  HorseServiceRelationListQueryParams,
  HorseServiceRelationOutDto,
  HorseServiceRelationUpdateInDto,
} from "@/types/api/horseServiceRelations";

export const horseServiceRelationList = (
  horseId: UUID,
  params: HorseServiceRelationListQueryParams = { limit: 100, offset: 0 },
): Promise<
  ApiResult<ApiListPaginatedResponseType<HorseServiceRelationOutDto>>
> => {
  const parametrizedUrl = addQueryParamsToUrl(
    `/horses/${horseId}/services`,
    params,
  );
  return apiFetch<ApiListPaginatedResponseType<HorseServiceRelationOutDto>>(
    parametrizedUrl,
  );
};

export const horseServiceRelationCreate = (
  horseId: UUID,
  payload: HorseServiceRelationCreateInDto,
): Promise<ApiResult<HorseServiceRelationOutDto>> => {
  return apiFetch<HorseServiceRelationOutDto>(`/horses/${horseId}/services`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const horseServiceRelationUpdate = (
  horseId: UUID,
  relationId: UUID,
  payload: HorseServiceRelationUpdateInDto,
): Promise<ApiResult<HorseServiceRelationOutDto>> => {
  return apiFetch<HorseServiceRelationOutDto>(
    `/horses/${horseId}/services/${relationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
};

export const horseServiceRelationDelete = (
  horseId: UUID,
  relationId: UUID,
): Promise<ApiResult<null>> => {
  return apiFetch<null>(`/horses/${horseId}/services/${relationId}`, {
    method: "DELETE",
  });
};

export const horseServiceRelationAvailableServices = (
  horseId: UUID,
  params: HorseServiceRelationAvailableServicesQueryParams = {},
): Promise<ApiResult<HorseServiceRelationAvailableServiceDto[]>> => {
  const parametrizedUrl = addQueryParamsToUrl(
    `/horses/${horseId}/available-services`,
    params,
  );
  return apiFetch<HorseServiceRelationAvailableServiceDto[]>(parametrizedUrl);
};
