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
import type { ApiResult } from "@/types/api/api";
import type {
  EmailOutDto,
  EmailWriteInDto,
  NotificationSettingOutDto,
} from "@/types/api/notifications";

export const fetchMyEmail = (): Promise<ApiResult<EmailOutDto>> => getMyEmail();
export const saveEmail = (
  data: EmailWriteInDto,
  exists: boolean,
): Promise<ApiResult<EmailOutDto>> =>
  exists ? updateEmail(data) : createEmail(data);
export const removeEmail = (userId: string): Promise<ApiResult<null>> =>
  deleteEmail(userId);
export const resendEmailConfirmation = (userId: string): Promise<ApiResult<null>> =>
  sendEmailConfirmation({ user_id: userId });
export const fetchNotificationSettings = (): Promise<
  ApiResult<NotificationSettingOutDto[]>
> => getNotificationSettings();
export const saveNotificationSetting = (
  eventCode: string,
  channelCode: string,
  enabled: boolean,
): Promise<ApiResult<NotificationSettingOutDto>> =>
  updateNotificationSetting(eventCode, channelCode, { enabled });
