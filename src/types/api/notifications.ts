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

export type VkBindingState = "PENDING" | "ACTIVE" | "BLOCKED";

export type VkBindingOutDto = {
  id: string;
  user_id: string;
  vk_peer_id: number | null;
  state: VkBindingState;
  vk_screen_name: string | null;
  vk_display_name: string | null;
};

export type VkBotInfoOutDto = {
  group_id: number;
  group_screen_name: string;
  link_command: string;
  group_url: string;
  dialog_url: string;
};

export type VkIssueConfirmationOutDto = {
  code: string;
  expires_at: string;
  state: VkBindingState;
  link_command: string;
  dialog_url: string;
};
