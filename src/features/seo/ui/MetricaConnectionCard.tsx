"use client";

import { Alert, Button, Card, Descriptions, Empty, Space, Spin } from "antd";
import { useSeoStyles } from "./seoStyles";
import { useMetricaConnection } from "../hooks/useMetricaConnection";
import { ConfirmActionModal } from "./ConfirmActionModal";
import { ConnectionWizardModal, type ConnectionWizardModalProps, type WizardTarget } from "./ConnectionWizardModal";

const placeholderTarget: WizardTarget = {
  key: "metrica",
  title: "Привязать Яндекс.Метрику",
  stepTitle: "Счётчик Метрики",
  renderStep: () => <Empty description="Выбор счётчика появится позже." />,
};

export type MetricaConnectionCardProps = {
  target?: WizardTarget;
  renderAccountStep?: ConnectionWizardModalProps["renderAccountStep"];
};

export function MetricaConnectionCard({ target = placeholderTarget, renderAccountStep }: MetricaConnectionCardProps = {}) {
  const { styles } = useSeoStyles();
  const state = useMetricaConnection();
  const account = state.connection?.yandex_account;
  const actionsDisabled = state.loading || state.pending;
  const bindDisabled = !state.canBind || actionsDisabled;
  const unlinkDisabled = !state.canUnlink || actionsDisabled;
  const confirmVisible = state.confirmOpen && state.canUnlink;
  const wizardVisible = state.wizardOpen && state.canBind;

  let content;
  if (state.loading) {
    content = <Spin tip="Загрузка привязки"><span>Загрузка привязки</span></Spin>;
  } else if (state.error) {
    content = (
      <Space orientation="vertical">
        <Alert type="error" title={state.error} showIcon />
        <Button onClick={state.refresh} disabled={!state.canRead}>Повторить</Button>
      </Space>
    );
  } else if (state.connection && account) {
    content = (
      <Space orientation="vertical">
        <Descriptions column={1} title="Яндекс.Метрика привязана">
          <Descriptions.Item label="Счётчик">{state.connection.counter_id}</Descriptions.Item>
          <Descriptions.Item label="Имя">{account.display_name || "—"}</Descriptions.Item>
          <Descriptions.Item label="Логин">{account.yandex_login}</Descriptions.Item>
          <Descriptions.Item label="Email">{account.email || "—"}</Descriptions.Item>
          {account.yandex_phone && <Descriptions.Item label="Телефон">{account.yandex_phone}</Descriptions.Item>}
        </Descriptions>
        <Button danger disabled={unlinkDisabled} onClick={state.openConfirmation}>Отвязать</Button>
      </Space>
    );
  } else {
    content = (
      <Space orientation="vertical">
        <Empty description="Яндекс.Метрика не привязана" />
        <Button type="primary" disabled={bindDisabled} onClick={state.openWizard}>Привязать</Button>
      </Space>
    );
  }

  return (
    <Card className={styles.connectionCard} title="Подключение Яндекс.Метрики">
      {content}
      <ConfirmActionModal
        open={confirmVisible}
        title="Отвязать счётчик?"
        text="Привязка счётчика Яндекс.Метрики будет удалена. Аккаунт Яндекса останется подключённым."
        pending={state.pending}
        error={state.mutationError}
        confirmDisabled={!state.canUnlink}
        onConfirm={state.unlinkCounter}
        onCancel={state.closeConfirmation}
      />
      <ConnectionWizardModal
        open={wizardVisible}
        target={target}
        renderAccountStep={renderAccountStep}
        onCancel={state.closeWizard}
        onDone={state.completeWizard}
        onConnectionChange={state.refresh}
      />
    </Card>
  );
}
