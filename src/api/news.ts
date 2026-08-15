import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import apiFetch, { addQueryParamsToUrl } from "./client";
import { UUID } from "crypto";
import {
  NewsCmsQueryParams,
  NewsCreateInDto,
  NewsOutDto,
  NewsPhotosUpdateInDto,
  NewsPublicOutDto,
  NewsUpdateInDto,
} from "@/types/api/news";

export const newsCmsList = (
  params: NewsCmsQueryParams = {},
): Promise<ApiResult<ApiListPaginatedResponseType<NewsOutDto>>> => {
  const url = addQueryParamsToUrl("/news-cms", params);
  return apiFetch<ApiListPaginatedResponseType<NewsOutDto>>(url);
};

export const newsDetail = (
  newsId: UUID,
): Promise<ApiResult<NewsPublicOutDto>> => {
  return apiFetch<NewsPublicOutDto>(`/news/${newsId}`, {
    method: "GET",
  });
};

export const newsCreate = (
  payload: NewsCreateInDto,
): Promise<ApiResult<NewsOutDto>> => {
  return apiFetch<NewsOutDto>("/news", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const newsUpdate = (
  newsId: UUID,
  payload: NewsUpdateInDto,
): Promise<ApiResult<NewsOutDto>> => {
  return apiFetch<NewsOutDto>(`/news/${newsId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const newsDelete = (newsId: UUID): Promise<ApiResult<void>> => {
  return apiFetch<void>(`/news/${newsId}`, {
    method: "DELETE",
  });
};

export const newsPhotosUpdate = (
  newsId: UUID,
  payload: NewsPhotosUpdateInDto,
): Promise<ApiResult<void>> => {
  return apiFetch<void>(`/news/${newsId}/photos`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
