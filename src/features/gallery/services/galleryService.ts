import { photoBatchDelete, photoCreate, photoDelete, photoList, photoUpdate } from "@/api/photos";
import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import { PhotoBatchDeleteInDto, PhotoCreateInDto, PhotoListQueryParams, PhotoOutDto, PhotoUpdateInDto } from "@/types/api/photos";
import { UUID } from "crypto";

export const fetchListPhotos = async (
    params: PhotoListQueryParams
): Promise<ApiResult<ApiListPaginatedResponseType<PhotoOutDto>>> => {
    return await photoList(params);
};

export const fetchCreatePhoto = async (
    data: PhotoCreateInDto
): Promise<ApiResult<PhotoOutDto>> => {
    return await photoCreate(data);
};

export const fetchUpdatePhoto = async (
    photoId: UUID,
    data: PhotoUpdateInDto
): Promise<ApiResult<PhotoOutDto>> => {
    return await photoUpdate(photoId, data);
};

export const fetchDeletePhoto = async (
    photoId: UUID
): Promise<ApiResult<null>> => {
    return await photoDelete(photoId);
};

export const fetchBatchDeletePhotos = async (
    data: PhotoBatchDeleteInDto
): Promise<ApiResult<null>> => {
    return await photoBatchDelete(data);
};