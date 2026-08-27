import {
  createEmail,
  deleteEmail,
  getMyEmail,
  sendEmailConfirmation,
  updateEmail,
} from "@/api/email";
import {
  getNotificationSettings,
  updateNotificationSetting,
} from "@/api/notificationSettings";
import {
  deleteVkBinding,
  getMyVkBinding,
  getVkBotInfo,
  issueVkConfirmation,
} from "@/api/vk";
import type { ApiResult } from "@/types/api/api";
import type {
  EmailOutDto,
  EmailWriteInDto,
  NotificationSettingOutDto,
  VkBindingOutDto,
  VkBotInfoOutDto,
  VkIssueConfirmationOutDto,
} from "@/types/api/notifications";

export const fetchMyEmail = (): Promise<ApiResult<EmailOutDto>> => getMyEmail();
export const saveEmail = (
  data: EmailWriteInDto,
  exists: boolean,
): Promise<ApiResult<EmailOutDto>> =>
  exists ? updateEmail(data) : createEmail(data);
export const removeEmail = (userId: string): Promise<ApiResult<null>> =>
  deleteEmail(userId);
export const resendEmailConfirmation = (
  userId: string,
): Promise<ApiResult<null>> => sendEmailConfirmation({ user_id: userId });
export const fetchNotificationSettings = (): Promise<
  ApiResult<NotificationSettingOutDto[]>
> => getNotificationSettings();
export const saveNotificationSetting = (
  eventCode: string,
  channelCode: string,
  enabled: boolean,
): Promise<ApiResult<NotificationSettingOutDto>> =>
  updateNotificationSetting(eventCode, channelCode, { enabled });
export const fetchMyVkBinding = (): Promise<ApiResult<VkBindingOutDto>> =>
  getMyVkBinding();
export const fetchVkBotInfo = (): Promise<ApiResult<VkBotInfoOutDto>> =>
  getVkBotInfo();
export const requestVkConfirmation = (): Promise<
  ApiResult<VkIssueConfirmationOutDto>
> => issueVkConfirmation();
export const removeVkBinding = (userId: string): Promise<ApiResult<null>> =>
  deleteVkBinding(userId);
