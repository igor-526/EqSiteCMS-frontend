"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button, Empty, Modal, Space, Steps } from "antd";
import { useSeoStyles } from "./seoStyles";
import type { YandexAccountOutDto } from "@/types/api/yandex";

export type WizardTargetStepProps = {
  account: YandexAccountOutDto;
  onDone: () => void;
  onBack: () => void;
  busy: boolean;
  onPendingChange: (pending: boolean) => void;
};

export type WizardTarget = {
  key: string;
  title: string;
  stepTitle: string;
  renderStep: (props: WizardTargetStepProps) => ReactNode;
};

export type WizardAccountStepProps = {
  selectedAccount: YandexAccountOutDto | null;
  onSelect: (account: YandexAccountOutDto | null) => void;
  onConnectionChange: () => void;
};

export type ConnectionWizardModalProps = {
  open: boolean;
  target: WizardTarget;
  renderAccountStep?: (props: WizardAccountStepProps) => ReactNode;
  onCancel: () => void;
  onDone: () => void;
  onConnectionChange: () => void;
};

// Unmounting this body resets both the account and step on every close.
function WizardBody({
  target, renderAccountStep, onCancel, onDone, onConnectionChange,
}: Omit<ConnectionWizardModalProps, "open">) {
  const [account, setAccount] = useState<YandexAccountOutDto | null>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { styles } = useSeoStyles();
  // Stable for target effects; the ref also guards navigation before React rerenders.
  const onPendingChange = useCallback((value: boolean) => {
    pending.current = value;
    setBusy(value);
  }, []);
  const cancel = () => { if (!pending.current) onCancel(); };
  const back = () => { if (!pending.current) setStep(0); };
  const selectAccount = (selected: YandexAccountOutDto | null) => {
    if (pending.current) return;
    setAccount(selected);
    setStep(selected ? 1 : 0);
  };

  useEffect(() => {
    const selected = step === 0
      ? contentRef.current?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')
      : null;
    (selected ?? headingRef.current)?.focus();
  }, [step]);

  const content = step === 1 && account
    ? target.renderStep({ account, onDone, onBack: back, busy, onPendingChange })
    : renderAccountStep?.({ selectedAccount: account, onSelect: selectAccount, onConnectionChange })
      ?? <Empty description="Выбор аккаунта появится позже." />;

  return (
    <Modal open title={target.title} onCancel={cancel} footer={null} destroyOnHidden
      closable={!busy} keyboard={!busy} maskClosable={!busy}>
      <Space orientation="vertical" size="large" className={styles.stepContent}>
        <Steps current={step} items={[{ title: "Аккаунт Яндекса" }, { title: target.stepTitle }]} />
        <div ref={contentRef} className={styles.stepContent}>
          <h3 ref={headingRef} tabIndex={-1}>{step === 1 ? target.stepTitle : "Аккаунт Яндекса"}</h3>
          {content}
        </div>
        <Space>
          <Button onClick={cancel} disabled={busy}>Отмена</Button>
          {step === 1 && <Button onClick={back} disabled={busy}>Назад</Button>}
        </Space>
      </Space>
    </Modal>
  );
}

export function ConnectionWizardModal(props: ConnectionWizardModalProps) {
  if (!props.open) return null;
  return <WizardBody key={props.target.key} {...props} />;
}
