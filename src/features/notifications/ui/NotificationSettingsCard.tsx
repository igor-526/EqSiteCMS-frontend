"use client";

import { Alert, Card, Empty, Skeleton, Switch, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { NotificationSettingOutDto } from "@/types/api/notifications";

type Props = {
  settings: NotificationSettingOutDto[];
  loading: boolean;
  error: string | null;
  pendingKey: string | null;
  onToggle: (setting: NotificationSettingOutDto) => void;
};

const CHANNEL_COLUMNS = [
  { code: "email", title: "Электронная почта" },
  { code: "vk", title: "VK" },
] as const;

type EventRow = {
  key: string;
  eventName: string;
  eventDescription: string | null;
  byChannel: Record<string, NotificationSettingOutDto>;
};

function toRows(settings: NotificationSettingOutDto[]): EventRow[] {
  const rows = new Map<string, EventRow>();
  for (const setting of settings) {
    const row = rows.get(setting.event_code) ?? {
      key: setting.event_code,
      eventName: setting.event_name,
      eventDescription: setting.event_description,
      byChannel: {},
    };
    row.byChannel[setting.channel_code] = setting;
    rows.set(setting.event_code, row);
  }
  return [...rows.values()];
}

export function NotificationSettingsCard(props: Props) {
  const rows = toRows(props.settings);
  const presentChannels = CHANNEL_COLUMNS.filter((channel) =>
    rows.some((row) => row.byChannel[channel.code] !== undefined),
  );

  const columns: ColumnsType<EventRow> = [
    {
      title: "Событие",
      dataIndex: "eventName",
      key: "event",
      render: (_value, row) => (
        <>
          <Typography.Text strong>{row.eventName}</Typography.Text>
          {row.eventDescription ? (
            <>
              <br />
              <Typography.Text type="secondary">
                {row.eventDescription}
              </Typography.Text>
            </>
          ) : null}
        </>
      ),
    },
    ...presentChannels.map<ColumnsType<EventRow>[number]>((channel) => ({
      title: channel.title,
      key: channel.code,
      align: "center" as const,
      width: 180,
      render: (_value: unknown, row: EventRow) => {
        const setting = row.byChannel[channel.code];
        if (!setting) return null;
        const key = `${setting.event_code}/${setting.channel_code}`;
        return (
          <Switch
            aria-label={`${row.eventName}: ${setting.channel_name}`}
            checked={setting.enabled}
            loading={props.pendingKey === key}
            disabled={props.pendingKey !== null}
            onChange={() => props.onToggle(setting)}
          />
        );
      },
    })),
  ];

  return (
    <Card title="События">
      {props.loading ? <Skeleton active paragraph={{ rows: 2 }} /> : null}
      {!props.loading && props.error ? (
        <Alert type="error" showIcon title={props.error} className="mb-4" />
      ) : null}
      {!props.loading ? (
        <Table<EventRow>
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty description="Для вашей роли нет доступных событий" />
            ),
          }}
        />
      ) : null}
    </Card>
  );
}
