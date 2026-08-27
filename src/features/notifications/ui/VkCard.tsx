"use client";

import {
  Alert,
  Button,
  Card,
  Modal,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import { type ReactElement, useState } from "react";
import type {
  VkBindingOutDto,
  VkBindingState,
  VkBotInfoOutDto,
  VkIssueConfirmationOutDto,
} from "@/types/api/notifications";

const STATE_LABEL: Record<VkBindingState, string> = {
  PENDING: "Ожидает подтверждения",
  ACTIVE: "Привязан",
  BLOCKED: "Бот заблокирован",
};

const DEFAULT_LINK_COMMAND = "/link";
const LINKED_FALLBACK_TITLE = "Аккаунт VK привязан";

type Props = {
  binding: VkBindingOutDto | null;
  botInfo: VkBotInfoOutDto | null;
  botInfoError: string | null;
  confirmation: VkIssueConfirmationOutDto | null;
  loading: boolean;
  error: string | null;
  pending: boolean;
  mutationError: string | null;
  deleteOpen: boolean;
  onIssueCode: () => void;
  onDeleteOpen: () => void;
  onDeleteClose: () => void;
  onDelete: () => void;
};

type SharedProps = {
  command: string;
  botInfo: VkBotInfoOutDto | null;
  confirmation: VkIssueConfirmationOutDto | null;
  pending: boolean;
  displayName: string | null;
  onIssueCode: () => void;
  onDeleteOpen: () => void;
};

function formatExpiry(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function isExpired(value: string): boolean {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
}

function DialogLink({ botInfo }: { botInfo: VkBotInfoOutDto | null }) {
  if (!botInfo) return null;
  return (
    <Typography.Link
      href={botInfo.dialog_url}
      target="_blank"
      rel="noopener noreferrer"
    >
      Открыть диалог с ботом
    </Typography.Link>
  );
}

function CopyHint({ copied }: { copied: boolean | null }) {
  if (copied === null) return null;
  if (copied) {
    return (
      <Typography.Text type="success">Команда скопирована</Typography.Text>
    );
  }
  return (
    <Typography.Text type="warning">
      Не удалось скопировать автоматически — выделите команду и скопируйте
      вручную.
    </Typography.Text>
  );
}

function ExpiryHint({ expiresAt }: { expiresAt: string }) {
  if (isExpired(expiresAt)) {
    return (
      <Typography.Text type="danger">
        Срок действия кода истёк — обновите код.
      </Typography.Text>
    );
  }
  return (
    <Typography.Text type="secondary">
      Код действителен до {formatExpiry(expiresAt)}
    </Typography.Text>
  );
}

function CodeBlock(props: {
  command: string;
  confirmation: VkIssueConfirmationOutDto;
  botInfo: VkBotInfoOutDto | null;
}) {
  const [copied, setCopied] = useState<boolean | null>(null);
  const fullCommand = `${props.command} ${props.confirmation.code}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullCommand);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Space orientation="vertical" size="small" className="w-full">
      <Typography.Text strong>Команда для бота</Typography.Text>
      <Space wrap align="center">
        <Typography.Text code data-testid="vk-link-command">
          {fullCommand}
        </Typography.Text>
        <Button size="small" onClick={copy}>
          Копировать
        </Button>
      </Space>
      <CopyHint copied={copied} />
      <ExpiryHint expiresAt={props.confirmation.expires_at} />
      <DialogLink botInfo={props.botInfo} />
    </Space>
  );
}

function Instruction({ command }: { command: string }) {
  return (
    <Space orientation="vertical" size={2}>
      <Typography.Text type="secondary">
        1. Откройте диалог с ботом группы VK в новой вкладке.
      </Typography.Text>
      <Typography.Text type="secondary">
        2. Отправьте боту сообщение вида «{command} КОД».
      </Typography.Text>
      <Typography.Text type="secondary">
        3. Дождитесь ответа бота о привязке аккаунта.
      </Typography.Text>
    </Space>
  );
}

function UnlinkButton(props: { pending: boolean; onClick: () => void }) {
  return (
    <Button danger disabled={props.pending} onClick={props.onClick}>
      Отвязать
    </Button>
  );
}

function UnlinkedState(props: SharedProps) {
  if (!props.confirmation) {
    return (
      <Space orientation="vertical" size="middle" className="w-full">
        <Typography.Text type="secondary">
          VK не привязан. Привяжите аккаунт, чтобы получать уведомления от бота.
        </Typography.Text>
        <Button
          type="primary"
          loading={props.pending}
          disabled={props.pending}
          onClick={props.onIssueCode}
        >
          Привязать
        </Button>
      </Space>
    );
  }
  return (
    <Space orientation="vertical" size="middle" className="w-full">
      <Instruction command={props.command} />
      <CodeBlock
        command={props.command}
        confirmation={props.confirmation}
        botInfo={props.botInfo}
      />
      <Button
        loading={props.pending}
        disabled={props.pending}
        onClick={props.onIssueCode}
      >
        Обновить код
      </Button>
    </Space>
  );
}

function PendingState(props: SharedProps) {
  return (
    <Space orientation="vertical" size="middle" className="w-full">
      <Space wrap>
        <Typography.Text strong>Привязка аккаунта VK</Typography.Text>
        <Tag color="orange">{STATE_LABEL.PENDING}</Tag>
      </Space>
      <Instruction command={props.command} />
      {props.confirmation ? (
        <CodeBlock
          command={props.command}
          confirmation={props.confirmation}
          botInfo={props.botInfo}
        />
      ) : (
        <Typography.Text type="secondary">
          Код не показан — обновите его, чтобы получить новую команду.
        </Typography.Text>
      )}
      <Space wrap>
        <Button
          loading={props.pending}
          disabled={props.pending}
          onClick={props.onIssueCode}
        >
          Обновить код
        </Button>
        <UnlinkButton pending={props.pending} onClick={props.onDeleteOpen} />
      </Space>
    </Space>
  );
}

function ActiveState(props: SharedProps) {
  return (
    <Space orientation="vertical" size="middle" className="w-full">
      <Space wrap>
        <Typography.Text strong>
          {props.displayName ?? LINKED_FALLBACK_TITLE}
        </Typography.Text>
        <Tag color="green">{STATE_LABEL.ACTIVE}</Tag>
      </Space>
      <Typography.Text type="secondary">
        Уведомления будут приходить в диалог с ботом.
      </Typography.Text>
      <DialogLink botInfo={props.botInfo} />
      <UnlinkButton pending={props.pending} onClick={props.onDeleteOpen} />
    </Space>
  );
}

function BlockedState(props: SharedProps) {
  return (
    <Space orientation="vertical" size="middle" className="w-full">
      <Space wrap>
        <Typography.Text strong className="text-red-700">
          {props.displayName ?? LINKED_FALLBACK_TITLE}
        </Typography.Text>
        <Tag color="red">{STATE_LABEL.BLOCKED}</Tag>
      </Space>
      <Typography.Text type="danger">
        Сообщения от группы запрещены, уведомления не доставляются.
      </Typography.Text>
      <Typography.Text type="secondary">
        Откройте диалог с ботом и разрешите сообщества присылать вам сообщения.
      </Typography.Text>
      <DialogLink botInfo={props.botInfo} />
      <UnlinkButton pending={props.pending} onClick={props.onDeleteOpen} />
    </Space>
  );
}

const STATE_VIEW: Record<VkBindingState, (props: SharedProps) => ReactElement> =
  {
    PENDING: PendingState,
    ACTIVE: ActiveState,
    BLOCKED: BlockedState,
  };

function BindingBody(props: SharedProps & { state: VkBindingState | null }) {
  const View = props.state === null ? UnlinkedState : STATE_VIEW[props.state];
  return <View {...props} />;
}

function UnlinkModal(props: {
  open: boolean;
  pending: boolean;
  mutationError: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={props.open}
      title="Отвязать VK?"
      okText="Отвязать"
      cancelText="Отмена"
      okButtonProps={{ danger: true, disabled: props.pending }}
      cancelButtonProps={{ disabled: props.pending }}
      confirmLoading={props.pending}
      onCancel={props.onClose}
      onOk={props.onConfirm}
    >
      <Typography.Paragraph>
        Привязка будет удалена. Для повторной привязки понадобится новый код.
      </Typography.Paragraph>
      {props.mutationError ? (
        <Alert type="error" showIcon title={props.mutationError} />
      ) : null}
    </Modal>
  );
}

export function VkCard(props: Props) {
  const command =
    props.confirmation?.link_command ??
    props.botInfo?.link_command ??
    DEFAULT_LINK_COMMAND;
  const displayName =
    props.binding?.vk_display_name ?? props.binding?.vk_screen_name ?? null;
  const showBody = !props.loading && !props.error;

  return (
    <Card title="VK для уведомлений">
      {props.loading ? <Skeleton active paragraph={{ rows: 2 }} /> : null}
      {!props.loading && props.error ? (
        <Alert type="error" showIcon title={props.error} />
      ) : null}
      {showBody ? (
        <Space orientation="vertical" size="middle" className="w-full">
          {props.botInfoError ? (
            <Alert
              type="warning"
              showIcon
              title="Интеграция с VK ещё не настроена администратором, ссылки недоступны."
              description={props.botInfoError}
            />
          ) : null}
          <BindingBody
            state={props.binding?.state ?? null}
            command={command}
            botInfo={props.botInfo}
            confirmation={props.confirmation}
            pending={props.pending}
            displayName={displayName}
            onIssueCode={props.onIssueCode}
            onDeleteOpen={props.onDeleteOpen}
          />
          {props.mutationError && !props.deleteOpen ? (
            <Alert type="error" showIcon title={props.mutationError} />
          ) : null}
        </Space>
      ) : null}
      <UnlinkModal
        open={props.deleteOpen}
        pending={props.pending}
        mutationError={props.mutationError}
        onClose={props.onDeleteClose}
        onConfirm={props.onDelete}
      />
    </Card>
  );
}
