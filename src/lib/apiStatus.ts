import type { ApiError, ApiResult, ApiSuccess } from "@/types/api/api";

export const API_STATUS = {
  OK: "ok",
  ERROR: "error",
} as const;

export type ApiStatusValue = (typeof API_STATUS)[keyof typeof API_STATUS];

export function isApiSuccess<T>(result: ApiResult<T>): result is ApiSuccess<T> {
  return result.status === API_STATUS.OK;
}

export function isApiError<T>(result: ApiResult<T>): result is ApiError {
  return result.status === API_STATUS.ERROR;
}

export function apiSuccess<T>(data: T | null): ApiSuccess<T> {
  return { status: API_STATUS.OK, data };
}

export function apiError(detail: string): ApiError {
  return { status: API_STATUS.ERROR, data: { detail } };
}
