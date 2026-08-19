import apiFetch from "./client";
import type { ApiResult } from "@/types/api/api";
import type {
  NotificationSettingOutDto,
  NotificationSettingWriteInDto,
} from "@/types/api/notifications";

export const getNotificationSettings = (): Promise<
  ApiResult<NotificationSettingOutDto[]>
> => apiFetch<NotificationSettingOutDto[]>("/notification-settings");

export const updateNotificationSetting = (
  eventCode: string,
  channelCode: string,
  data: NotificationSettingWriteInDto,
): Promise<ApiResult<NotificationSettingOutDto>> =>
  apiFetch<NotificationSettingOutDto>(
    `/notification-settings/${encodeURIComponent(eventCode)}/${encodeURIComponent(channelCode)}`,
    { method: "PATCH", body: JSON.stringify(data) },
  );
