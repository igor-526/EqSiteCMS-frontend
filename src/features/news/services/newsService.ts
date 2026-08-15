import {
  newsCmsList,
  newsCreate,
  newsDelete,
  newsPhotosUpdate,
  newsUpdate,
} from "@/api/news";
import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import {
  NewsCmsQueryParams,
  NewsCreateInDto,
  NewsOutDto,
  NewsPhotosUpdateInDto,
  NewsUpdateInDto,
} from "@/types/api/news";
import { UUID } from "crypto";

export const fetchNewsCmsList = async (
  params: NewsCmsQueryParams,
): Promise<ApiResult<ApiListPaginatedResponseType<NewsOutDto>>> => {
  return await newsCmsList(params);
};

export const fetchNewsCreate = async (
  data: NewsCreateInDto,
): Promise<ApiResult<NewsOutDto>> => {
  return await newsCreate(data);
};

export const fetchNewsUpdate = async (
  newsId: UUID,
  data: NewsUpdateInDto,
): Promise<ApiResult<NewsOutDto>> => {
  return await newsUpdate(newsId, data);
};

export const fetchNewsDelete = async (
  newsId: UUID,
): Promise<ApiResult<void>> => {
  return await newsDelete(newsId);
};

export const fetchNewsPhotosUpdate = async (
  newsId: UUID,
  data: NewsPhotosUpdateInDto,
): Promise<ApiResult<void>> => {
  return await newsPhotosUpdate(newsId, data);
};
