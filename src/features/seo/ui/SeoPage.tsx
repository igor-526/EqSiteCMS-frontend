"use client";

import { useState } from "react";
import { Result, Tabs } from "antd";
import { useSeoStyles } from "./seoStyles";
import { MetricaConnectionCard } from "./MetricaConnectionCard";
import { SEO_ACTIONS, useSeoScopes } from "../hooks/useSeoScopes";
import { WebmasterStub } from "./WebmasterStub";
import { YandexAccountStep } from "./YandexAccountStep";
import type { WizardAccountStepProps } from "./ConnectionWizardModal";
import { METRICA_WIZARD_TARGET } from "../wizardTargets";

const renderAccountStep = (props: WizardAccountStepProps) => <YandexAccountStep {...props} />;

export function SeoPage() {
  const { hasPermission } = useSeoScopes();
  const { styles } = useSeoStyles();
  const [activeTab, setActiveTab] = useState("metrica");

  if (!hasPermission(SEO_ACTIONS.VIEW)) {
    return (
      <section aria-label="Доступ к SEO" tabIndex={0}>
        <Result
          status="403"
          title="Недостаточно прав"
          subTitle="Раздел SEO доступен только администраторам."
        />
      </section>
    );
  }

  return (
    <Tabs
      id="seo-tabs"
      role="region"
      aria-label="Сервисы Яндекса"
      className={styles.tabs}
      activeKey={activeTab}
      onChange={setActiveTab}
      items={[
        {
          key: "metrica",
          label: "Яндекс.Метрика",
          children: <MetricaConnectionCard target={METRICA_WIZARD_TARGET} renderAccountStep={renderAccountStep} />,
        },
        {
          key: "webmaster",
          label: "Яндекс.Вебмастер",
          children: <WebmasterStub />,
        },
      ]}
    />
  );
}
