"use client";

import { Alert, Card, Empty, Skeleton, Space, Switch, Typography } from "antd";
import type { NotificationSettingOutDto } from "@/types/api/notifications";

type Props = {
  settings: NotificationSettingOutDto[];
  loading: boolean;
  error: string | null;
  pendingKey: string | null;
  onToggle: (setting: NotificationSettingOutDto) => void;
};

export function NotificationSettingsCard(props: Props) {
  return (
    <Card title="События">
      {props.loading ? <Skeleton active paragraph={{ rows: 2 }} /> : null}
      {!props.loading && props.error ? <Alert type="error" showIcon message={props.error} className="mb-4" /> : null}
      {!props.loading && !props.error && props.settings.length === 0 ? (
        <Empty description="Для вашей роли нет доступных событий" />
      ) : null}
      {!props.loading ? props.settings.map((setting) => {
        const key = `${setting.event_code}/${setting.channel_code}`;
        return (
          <Space key={key} align="start" className="w-full justify-between">
            <Space direction="vertical" size={2}>
              <Typography.Text strong>{setting.event_name}</Typography.Text>
              <Typography.Text type="secondary">
                {setting.event_description || "Email-уведомление о новом запросе обратного звонка."}
              </Typography.Text>
            </Space>
            <Switch
              aria-label={`${setting.event_name}: email`}
              checked={setting.enabled}
              loading={props.pendingKey === key}
              disabled={props.pendingKey !== null}
              onChange={() => props.onToggle(setting)}
            />
          </Space>
        );
      }) : null}
    </Card>
  );
}
