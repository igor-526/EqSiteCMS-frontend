"use client";

import { useState } from "react";
import { Button, Result, Tabs } from "antd";
import { usePageNormalization } from "../hooks/usePageNormalization";
import { PageNormalizationModal } from "./PageNormalizationModal";
import { useSeoStyles } from "./seoStyles";
import { MetricaConnectionCard } from "./MetricaConnectionCard";
import { SEO_ACTIONS, useSeoScopes } from "../hooks/useSeoScopes";
import { WebmasterStub } from "./WebmasterStub";
import { YandexAccountStep } from "./YandexAccountStep";
import type { WizardAccountStepProps } from "./ConnectionWizardModal";
import { METRICA_WIZARD_TARGET } from "../wizardTargets";
import { useSeoDataTable } from "../hooks/useSeoDataTable";
import { SeoPagesPanel } from "./SeoPagesPanel";
import { SeoQueriesPanel } from "./SeoQueriesPanel";

const PAGES = "pages";
const QUERIES = "queries";

const renderAccountStep = (props: WizardAccountStepProps) => <YandexAccountStep {...props} />;

export function SeoPage() {
  const { hasPermission } = useSeoScopes();
  const { styles } = useSeoStyles();
  const [activeTab, setActiveTab] = useState("metrica");
  const normalization = usePageNormalization();
  const normalizationAction = activeTab === PAGES && hasPermission(SEO_ACTIONS.LIST_NORMALIZATION)
    ? <Button onClick={normalization.show}>Нормализация</Button> : undefined;
  const pages = useSeoDataTable(PAGES, activeTab === PAGES);
  const queries = useSeoDataTable(QUERIES, activeTab === QUERIES);

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
    <>
    <Tabs
      renderTabBar={(props, DefaultTabBar) => (
        <div className={styles.tabHeader}>
          <DefaultTabBar {...props} />
          {normalizationAction}
        </div>
      )}
      id="seo-tabs"
      role="region"
      aria-label="SEO"
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
        {
          key: "pages",
          label: "Страницы",
          children: <SeoPagesPanel table={pages} />,
        },
        {
          key: "queries",
          label: "Запросы",
          children: <SeoQueriesPanel table={queries} />,
        },
      ]}
    />
    <PageNormalizationModal model={normalization} />
    </>
  );
}
