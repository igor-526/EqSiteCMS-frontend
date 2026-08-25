import apiFetch, { addQueryParamsToUrl } from "./client";
import type { ApiListPaginatedResponseType, ApiResult } from "@/types/api/api";
import type {
  CallbackRequestOutDto,
  CallbackRequestsQuery,
  CallbackRequestSpamUpdateInDto,
  CallbackRequestStatusOutDto,
  CallbackRequestStatusUpdateInDto,
} from "@/types/api/callbackRequests";

export const callbackRequestsList = (params: CallbackRequestsQuery) =>
  apiFetch<ApiListPaginatedResponseType<CallbackRequestOutDto>>(
    addQueryParamsToUrl("/callback_requests", params),
  );

export const callbackRequestDetail = (id: string) =>
  apiFetch<CallbackRequestOutDto>(`/callback_requests/${id}`);

export const callbackRequestStatuses = (): Promise<ApiResult<CallbackRequestStatusOutDto[]>> =>
  apiFetch("/callback_requests/statuses");

export const callbackRequestStatusUpdate = (id: string, payload: CallbackRequestStatusUpdateInDto) =>
  apiFetch<CallbackRequestOutDto>(`/callback_requests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const callbackRequestSpamUpdate = (id: string, payload: CallbackRequestSpamUpdateInDto) =>
  apiFetch<CallbackRequestOutDto>(`/callback_requests/${id}/spam`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
