import { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import apiFetch, { addQueryParamsToUrl, apiFetchFormData } from "./client";
import {
  PhotoBatchDeleteInDto,
  PhotoBatchUploadResponseDto,
  PhotoCreateInDto,
  PhotoListQueryParams,
  PhotoOutDto,
  PhotoUpdateInDto,
} from "@/types/api/photos";
import { UUID } from "crypto";

export const photoList = async (
  params: PhotoListQueryParams,
  options?: RequestInit,
): Promise<ApiResult<ApiListPaginatedResponseType<PhotoOutDto>>> => {
  const paramtrizedUrl = addQueryParamsToUrl("/photos", params);
  return apiFetch<ApiListPaginatedResponseType<PhotoOutDto>>(
    paramtrizedUrl,
    options,
  );
};

export const photoCreate = async (
  payload: PhotoCreateInDto,
): Promise<ApiResult<PhotoOutDto>> => {
  const formData = new FormData();
  formData.append("file", payload.file);

  if (
    payload.name !== undefined &&
    payload.name !== null &&
    payload.name.trim() !== ""
  ) {
    formData.append("name", payload.name);
  }

  if (
    payload.description !== undefined &&
    payload.description !== null &&
    payload.description.trim() !== ""
  ) {
    formData.append("description", payload.description);
  }

  return apiFetchFormData<PhotoOutDto>("/photos", formData, {
    method: "POST",
  });
};

export const photoUpdate = async (
  photoId: UUID,
  payload: PhotoUpdateInDto,
): Promise<ApiResult<PhotoOutDto>> => {
  const formData = new FormData();
  if (payload.file !== undefined && payload.file !== null) {
    formData.append("file", payload.file);
  }

  if (
    payload.name !== undefined &&
    payload.name !== null &&
    payload.name.trim() !== ""
  ) {
    formData.append("name", payload.name);
  }

  if (
    payload.description !== undefined &&
    payload.description !== null &&
    payload.description.trim() !== ""
  ) {
    formData.append("description", payload.description);
  }

  return apiFetchFormData<PhotoOutDto>(`/photos/${photoId}`, formData, {
    method: "PATCH",
  });
};

export const photoDelete = async (photoId: UUID): Promise<ApiResult<null>> => {
  return apiFetch<null>(`/photos/${photoId}`, {
    method: "DELETE",
  });
};

export const photoBatchDelete = async (
  payload: PhotoBatchDeleteInDto,
): Promise<ApiResult<null>> => {
  return apiFetch<null>(`/photos/batch-delete`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const uploadPhotosToPrice = async (
  priceId: UUID,
  files: File[],
  names?: string[],
  descriptions?: string[],
): Promise<ApiResult<PhotoBatchUploadResponseDto>> => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append("files", file);
  });
  
  if (names && names.length > 0) {
    names.forEach((name) => {
      if (name && name.trim() !== "") {
        formData.append("names", name);
      }
    });
  }
  
  if (descriptions && descriptions.length > 0) {
    descriptions.forEach((description) => {
      if (description && description.trim() !== "") {
        formData.append("descriptions", description);
      }
    });
  }
  
  return apiFetchFormData<PhotoBatchUploadResponseDto>(
    `/prices/${priceId}/photos/upload`,
    formData,
    {
      method: "POST",
    },
  );
};

export const uploadPhotosToHorse = async (
  horseId: UUID,
  files: File[],
  names?: string[],
  descriptions?: string[],
): Promise<ApiResult<PhotoBatchUploadResponseDto>> => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append("files", file);
  });
  
  if (names && names.length > 0) {
    names.forEach((name) => {
      if (name && name.trim() !== "") {
        formData.append("names", name);
      }
    });
  }
  
  if (descriptions && descriptions.length > 0) {
    descriptions.forEach((description) => {
      if (description && description.trim() !== "") {
        formData.append("descriptions", description);
      }
    });
  }
  
  return apiFetchFormData<PhotoBatchUploadResponseDto>(
    `/horses/${horseId}/photos/upload`,
    formData,
    {
      method: "POST",
    },
  );
};

export const uploadPhotosToNews = async (
  newsId: UUID,
  files: File[],
  names?: string[],
  descriptions?: string[],
): Promise<ApiResult<PhotoBatchUploadResponseDto>> => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append("files", file);
  });
  
  if (names && names.length > 0) {
    names.forEach((name) => {
      if (name && name.trim() !== "") {
        formData.append("names", name);
      }
    });
  }
  
  if (descriptions && descriptions.length > 0) {
    descriptions.forEach((description) => {
      if (description && description.trim() !== "") {
        formData.append("descriptions", description);
      }
    });
  }
  
  return apiFetchFormData<PhotoBatchUploadResponseDto>(
    `/news/${newsId}/photos/upload`,
    formData,
    {
      method: "POST",
    },
  );
};
