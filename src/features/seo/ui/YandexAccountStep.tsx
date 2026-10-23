"use client";

import { useEffect, useRef } from "react";
import { Alert, Button, Empty, Space, Spin, Typography } from "antd";
import { DisconnectOutlined } from "@ant-design/icons";
import { useSeoStyles } from "./seoStyles";
import { useYandexAccounts } from "../hooks/useYandexAccounts";
import { useYandexOAuthPopup } from "../hooks/useYandexOAuthPopup";
import type { WizardAccountStepProps } from "./ConnectionWizardModal";
import { ConfirmActionModal } from "./ConfirmActionModal";

export type YandexAccountStepProps = WizardAccountStepProps & {
  onAddAccount?: () => void;
};

export function YandexAccountStep({ onAddAccount, ...props }: YandexAccountStepProps) {
  const { styles } = useSeoStyles();
  const state = useYandexAccounts(props);
  const oauth = useYandexOAuthPopup(state.refresh);
  const addAccount = onAddAccount ?? oauth.open;
  const confirmationOpen = !!state.confirmation && state.canUnlink;
  const moreDisabled = state.loading || state.pending;
  const addDisabled = state.pending;
  const listRef = useRef<HTMLUListElement>(null);
  const restoredFocus = useRef(false);

  useEffect(() => {
    if (restoredFocus.current || !props.selectedAccount || state.loading) return;
    const selected = listRef.current?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
    if (selected) {
      selected.focus();
      restoredFocus.current = true;
    }
  }, [props.selectedAccount, state.loading, state.accounts]);

  return (
    <Space orientation="vertical" size="middle" className={styles.stepContent}>
      {state.loading && <Spin tip="Загрузка аккаунтов"><span>Загрузка аккаунтов</span></Spin>}
      {state.error && <Alert type="error" title={state.error} showIcon />}
      <Button onClick={state.refresh} disabled={!state.canRead || moreDisabled}>Обновить аккаунты</Button>
      {!state.loading && !state.error && state.accounts.length === 0 && <Empty description="Нет аккаунтов. Добавьте аккаунт Яндекса." />}
      {state.accounts.length > 0 && (
        <ul ref={listRef} className={styles.compactList} aria-label="Аккаунты Яндекса">
          {state.accounts.map((account) => (
            <li key={account.id} className={styles.compactRow}>
              <Button
                type="text"
                className={styles.rowAction}
                aria-pressed={props.selectedAccount?.id === account.id}
                disabled={!state.canRead || state.pending}
                onClick={() => state.selectAccount(account)}
              >
                <span className={styles.rowDetails}>
                  <Typography.Text strong>{account.display_name || "Без имени"}</Typography.Text>{" "}
                  <Typography.Text type="secondary">{account.yandex_login} · {account.email || "Email не указан"}</Typography.Text>
                </span>
              </Button>
              {state.canUnlink && (
                <Button
                  type="text"
                  danger
                  className={styles.unlinkAction}
                  icon={<DisconnectOutlined />}
                  aria-label={`Отвязать аккаунт ${account.yandex_login}`}
                  disabled={state.pending}
                  onClick={() => state.openConfirmation(account)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      {state.accounts.length < state.total && <Button onClick={state.loadMore} disabled={moreDisabled}>Показать ещё</Button>}
      {oauth.error && <Alert type="error" title={oauth.error} showIcon />}
      {state.canAdd && <Button type="dashed" onClick={addAccount} disabled={addDisabled}>Добавить аккаунт</Button>}
      <ConfirmActionModal
        open={confirmationOpen}
        title="Отвязать аккаунт Яндекса?"
        text={state.confirmation?.yandex_login}
        warning="Аккаунт будет отвязан. Привязка счётчика через этот аккаунт тоже будет удалена."
        pending={state.pending}
        error={state.mutationError}
        confirmDisabled={!state.canUnlink}
        onConfirm={state.unlinkAccount}
        onCancel={state.closeConfirmation}
      />
    </Space>
  );
}
