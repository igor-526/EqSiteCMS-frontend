"use client";

import { Alert, Button, Card, Skeleton, Space, Tag, Typography } from "antd";
import type { EmailOutDto } from "@/types/api/notifications";

type Props = {
  email: EmailOutDto | null;
  loading: boolean;
  error: string | null;
  pending: boolean;
  onCreate: () => void;
  onChange: () => void;
  onDelete: () => void;
  onResend: () => void;
};

export function EmailCard(props: Props) {
  return (
    <Card title="Email для уведомлений">
      {props.loading ? <Skeleton active paragraph={{ rows: 2 }} /> : null}
      {!props.loading && props.error ? (
        <Alert type="error" showIcon title={props.error} />
      ) : null}
      {!props.loading && !props.error && !props.email ? (
        <Space orientation="vertical" size="middle">
          <Typography.Text type="secondary">
            Email не привязан. Добавьте адрес, чтобы получать доступные
            уведомления.
          </Typography.Text>
          <Button type="primary" onClick={props.onCreate}>
            Добавить email
          </Button>
        </Space>
      ) : null}
      {!props.loading && !props.error && props.email ? (
        <Space orientation="vertical" size="middle" className="w-full">
          <Space wrap>
            <Typography.Text
              strong
              className={props.email.approved ? undefined : "text-red-700"}
            >
              {props.email.email}
            </Typography.Text>
            <Tag color={props.email.approved ? "green" : "red"}>
              {props.email.approved ? "Подтверждён" : "Не подтверждён"}
            </Tag>
          </Space>
          {!props.email.approved ? (
            <Typography.Text type="danger">
              Подтвердите адрес, иначе уведомления отправляться не будут.
            </Typography.Text>
          ) : null}
          <Space wrap>
            <Button onClick={props.onChange}>Изменить</Button>
            <Button danger onClick={props.onDelete}>
              Удалить
            </Button>
            {!props.email.approved ? (
              <Button
                loading={props.pending}
                disabled={props.pending}
                onClick={props.onResend}
              >
                Отправить подтверждение повторно
              </Button>
            ) : null}
          </Space>
        </Space>
      ) : null}
    </Card>
  );
}
