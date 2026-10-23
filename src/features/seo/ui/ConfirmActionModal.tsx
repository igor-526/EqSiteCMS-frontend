"use client";

import type { ReactNode } from "react";
import { Alert, Modal, Space } from "antd";

export type ConfirmActionModalProps = {
  open: boolean;
  title: string;
  text: ReactNode;
  warning?: ReactNode;
  pending: boolean;
  error?: string | null;
  confirmDisabled?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function ConfirmActionModal({
  open, title, text, warning, pending, error, confirmDisabled = false,
  onConfirm, onCancel,
}: ConfirmActionModalProps) {
  if (!open) return null;
  return (
    <Modal
      open={open}
      title={title}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Подтвердить"
      cancelText="Отмена"
      confirmLoading={pending}
      okButtonProps={{ danger: true, disabled: pending || confirmDisabled }}
      cancelButtonProps={{ disabled: pending }}
      closable={!pending}
      keyboard={!pending}
      maskClosable={!pending}
      destroyOnHidden
    >
      <Space orientation="vertical">
        {text}
        {warning && <Alert type="warning" title={warning} showIcon />}
        {error && <Alert type="error" title={error} showIcon />}
      </Space>
    </Modal>
  );
}
