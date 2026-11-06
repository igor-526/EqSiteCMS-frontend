"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { Alert, Modal, Space } from "antd";
import { createStyles } from "antd-style";
import { useConfirmationFocusReturn } from "../hooks/useConfirmationFocusReturn";
import { useConfirmationDeadline } from "../hooks/useConfirmationDeadline";

const CONSEQUENCES_MODAL_WIDTH = 640;
const DEFAULT_MODAL_WIDTH = 520;
const ESCAPE_KEY = "Escape";

const useStyles = createStyles(({ css }) => ({
  body: css`
    max-height: calc(100vh - 240px);
    overflow-y: auto;
    overflow-wrap: anywhere;
  `,
}));

export type ConfirmActionModalProps = {
  open: boolean;
  title: string;
  text: ReactNode;
  warning?: ReactNode;
  consequences?: readonly ReactNode[];
  recovery?: ReactNode;
  entityKey?: string;
  confirmationDelayMs?: number;
  isolateEscape?: boolean;
  pending: boolean;
  error?: string | null;
  confirmDisabled?: boolean;
  okText?: string;
  okDanger?: boolean;
  okClassName?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function ConfirmActionModal(props: ConfirmActionModalProps) {
  if (!props.open) return null;
  return <ConfirmationSession {...props} />;
}

function ConfirmationSession(props: ConfirmActionModalProps) {
  useConfirmationFocusReturn(!!props.consequences);
  return <OpenConfirmation key={props.entityKey} {...props} />;
}

function OpenConfirmation({
  open, title, text, warning, consequences, recovery, pending, error, confirmDisabled = false,
  confirmationDelayMs = 0, isolateEscape = false,
  onConfirm, onCancel, okText = "Подтвердить", okDanger = true, okClassName,
}: ConfirmActionModalProps) {
  const { styles } = useStyles();
  const { remaining, confirm } = useConfirmationDeadline({
    delayMs: confirmationDelayMs, pending, disabled: confirmDisabled, onConfirm,
  });
  const handleEscapeCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== ESCAPE_KEY) return;
    // React portal keyboard events can reach the parent wizard. Consume only
    // Escape here, including pending; leave AntD's Tab/focus trap untouched.
    event.stopPropagation();
    if (!pending) onCancel();
  };
  const confirmLabel = remaining > 0 ? `${okText} (${remaining})` : okText;
  const content = (
    <Space orientation="vertical">
      {text}
      {consequences && <ul aria-label="Последствия удаления">{consequences.map((item, index) => <li key={index}>{item}</li>)}</ul>}
      {recovery && <Alert type="info" title="Как восстановить подключение" description={recovery} showIcon />}
      {warning && <Alert type="warning" title={warning} showIcon />}
      {error && <Alert type="error" title={error} showIcon />}
    </Space>
  );
  return (
    <Modal
      open={open}
      title={title}
      centered={!!consequences}
      width={consequences ? CONSEQUENCES_MODAL_WIDTH : DEFAULT_MODAL_WIDTH}
      classNames={consequences ? undefined : { body: styles.body }}
      focusTriggerAfterClose={consequences ? false : undefined}
      wrapProps={isolateEscape ? { onKeyDownCapture: handleEscapeCapture } : undefined}
      onOk={confirm}
      onCancel={onCancel}
      okText={confirmLabel}
      cancelText="Отмена"
      confirmLoading={pending}
      okButtonProps={{ danger: okDanger, className: okClassName, disabled: pending || confirmDisabled || remaining > 0 }}
      cancelButtonProps={{ disabled: pending }}
      closable={!pending}
      keyboard={!pending}
      maskClosable={!pending}
      destroyOnHidden
    >
      {consequences ? (
        <div className={styles.body} role="region" aria-label={`Содержание: ${title}`} tabIndex={0}>
          {content}
        </div>
      ) : content}
    </Modal>
  );
}
