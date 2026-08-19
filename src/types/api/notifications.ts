export type EmailOutDto = {
  id: string;
  user_id: string;
  email: string;
  approved: boolean;
};

export type EmailWriteInDto = {
  user_id: string;
  email: string;
};

export type EmailSendConfirmationInDto = {
  user_id: string;
};

export type NotificationSettingOutDto = {
  user_id: string;
  event_code: string;
  event_name: string;
  event_description: string | null;
  channel_code: string;
  channel_name: string;
  enabled: boolean;
};

export type NotificationSettingWriteInDto = {
  enabled: boolean;
};
