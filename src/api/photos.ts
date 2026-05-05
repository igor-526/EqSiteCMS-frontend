import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import apiFetch, { addQueryParamsToUrl, apiFetchFormData } from "./client";
import { PhotoBatchDeleteInDto, PhotoCreateInDto, PhotoListQueryParams, PhotoOutDto, PhotoUpdateInDto } from "@/types/api/photos";
import { UUID } from "crypto";

export const photoList = async (
    params: PhotoListQueryParams,
    options?: RequestInit
): Promise<ApiResult<ApiListPaginatedResponseType<PhotoOutDto>>> => {
    const paramtrizedUrl = addQueryParamsToUrl("/photos", params);
    return apiFetch<ApiListPaginatedResponseType<PhotoOutDto>>(paramtrizedUrl, options);
};

export const photoCreate = async (
    payload: PhotoCreateInDto
): Promise<ApiResult<PhotoOutDto>> => {
    const formData = new FormData();
    formData.append("file", payload.file);
    
    if (payload.name !== undefined && payload.name !== null && payload.name.trim() !== "") {
        formData.append("name", payload.name);
    }
    
    if (payload.description !== undefined && payload.description !== null && payload.description.trim() !== "") {
        formData.append("description", payload.description);
    }

    return apiFetchFormData<PhotoOutDto>("/photos", formData, {
        method: "POST",
    });
};

export const photoUpdate = async (
    photoId: UUID,
    payload: PhotoUpdateInDto
): Promise<ApiResult<PhotoOutDto>> => {
    const formData = new FormData();
    if (payload.file !== undefined && payload.file !== null) {
        formData.append("file", payload.file);
    }
    
    if (payload.name !== undefined && payload.name !== null && payload.name.trim() !== "") {
        formData.append("name", payload.name);
    }

    if (payload.description !== undefined && payload.description !== null && payload.description.trim() !== "") {
        formData.append("description", payload.description);
    }

    return apiFetchFormData<PhotoOutDto>(`/photos/${photoId}`, formData, {
        method: "PATCH",
    });
};

export const photoDelete = async (
    photoId: UUID
): Promise<ApiResult<null>> => {
    return apiFetch<null>(`/photos/${photoId}`, {
        method: "DELETE",
    });
};

export const photoBatchDelete = async (
    payload: PhotoBatchDeleteInDto
): Promise<ApiResult<null>> => {
    return apiFetch<null>(`/photos/batch-delete`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
};