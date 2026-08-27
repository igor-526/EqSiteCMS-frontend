import apiFetch from "./client";
import type { ApiResult } from "@/types/api/api";
import type {
  VkBindingOutDto,
  VkBotInfoOutDto,
  VkIssueConfirmationOutDto,
} from "@/types/api/notifications";

export const getMyVkBinding = (): Promise<ApiResult<VkBindingOutDto>> =>
  apiFetch<VkBindingOutDto>("/vks/me");

export const getVkBotInfo = (): Promise<ApiResult<VkBotInfoOutDto>> =>
  apiFetch<VkBotInfoOutDto>("/vks/bot-info");

export const issueVkConfirmation = (): Promise<
  ApiResult<VkIssueConfirmationOutDto>
> =>
  apiFetch<VkIssueConfirmationOutDto>("/vks/issue-confirmation", {
    method: "POST",
  });

export const deleteVkBinding = (userId: string): Promise<ApiResult<null>> =>
  apiFetch<null>(`/vks/${userId}`, { method: "DELETE" });
