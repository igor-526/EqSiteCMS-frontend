"use client";

import { Alert, Form, Input, Modal, Typography } from "antd";
import type { EmailOutDto } from "@/types/api/notifications";
import type { EmailModalMode } from "../hooks/useNotifications";

type Props = {
  mode: EmailModalMode;
  draft: string;
  validationError: string | null;
  mutationError: string | null;
  pending: boolean;
  deleteOpen: boolean;
  email: EmailOutDto | null;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onDeleteClose: () => void;
  onDelete: () => void;
};

export function EmailModals(props: Props) {
  return (
    <>
      <Modal
        open={props.mode !== null}
        title={props.mode === "change" ? "Изменить email" : "Добавить email"}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={props.pending}
        okButtonProps={{ disabled: props.pending }}
        cancelButtonProps={{ disabled: props.pending }}
        onCancel={props.onClose}
        onOk={props.onSubmit}
        destroyOnHidden
      >
        <Alert
          type="warning"
          showIcon
          title="После сохранения адрес потребуется подтвердить повторно."
          className="mb-4"
        />
        <Form layout="vertical">
          <Form.Item
            label="Email"
            htmlFor="notification-email"
            validateStatus={props.validationError ? "error" : undefined}
            help={props.validationError}
          >
            <Input
              id="notification-email"
              type="email"
              autoComplete="email"
              value={props.draft}
              disabled={props.pending}
              onChange={(event) => props.onDraftChange(event.target.value)}
              onPressEnter={props.onSubmit}
            />
          </Form.Item>
        </Form>
        {props.mutationError ? (
          <Alert type="error" showIcon title={props.mutationError} />
        ) : null}
      </Modal>
      <Modal
        open={props.deleteOpen}
        title="Удалить email?"
        okText="Удалить"
        cancelText="Отмена"
        okButtonProps={{ danger: true, disabled: props.pending }}
        cancelButtonProps={{ disabled: props.pending }}
        confirmLoading={props.pending}
        onCancel={props.onDeleteClose}
        onOk={props.onDelete}
      >
        <Typography.Paragraph>
          {props.email?.approved
            ? "Подтверждённый email будет удалён, и уведомления перестанут приходить."
            : "Неподтверждённый email будет удалён."}
        </Typography.Paragraph>
        {props.mutationError ? (
          <Alert type="error" showIcon title={props.mutationError} />
        ) : null}
      </Modal>
    </>
  );
}
