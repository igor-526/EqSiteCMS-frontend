"use client";

import { useEffect, useRef, useState, type ComponentRef } from "react";
import { FilterOutlined, SyncOutlined } from "@ant-design/icons";
import { TablePaginator } from "@/ui/TablePaginator";
import { useSeoPagesTable } from "../hooks/useSeoPagesTable";
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
import { useSeoQueriesTable } from "../hooks/useSeoQueriesTable";
import { SeoPagesPanel } from "./SeoPagesPanel";
import { SeoQueriesPanel } from "./SeoQueriesPanel";
import { useSeoParseRefresh } from "../hooks/useSeoParseRefresh";
import { ConfirmActionModal } from "./ConfirmActionModal";

const PAGES = "pages";
const QUERIES = "queries";

const renderAccountStep = (props: WizardAccountStepProps) => <YandexAccountStep {...props} />;

export function SeoPage() {
  const { hasPermission } = useSeoScopes();
  const { styles } = useSeoStyles();
  const [activeTab, setActiveTab] = useState("metrica");
  const normalization = usePageNormalization();
  const parseRefresh = useSeoParseRefresh();
  const refreshButton = useRef<ComponentRef<typeof Button>>(null);
  const wasRefreshOpen = useRef(false);
  useEffect(() => {
    if (wasRefreshOpen.current && !parseRefresh.open) refreshButton.current?.focus();
    wasRefreshOpen.current = parseRefresh.open;
  }, [parseRefresh.open]);
  const refreshAction = parseRefresh.canStart
    ? <Button ref={refreshButton} icon={<SyncOutlined aria-hidden />} onClick={parseRefresh.show} disabled={parseRefresh.pending}>Обновить данные</Button>
    : undefined;
  const normalizationAction = activeTab === PAGES && hasPermission(SEO_ACTIONS.LIST_NORMALIZATION)
    ? <Button onClick={normalization.show}>Нормализация</Button> : undefined;
  const pages = useSeoPagesTable(activeTab === PAGES);
  const queries = useSeoQueriesTable(activeTab === QUERIES);

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
          {activeTab === PAGES && <div className={styles.pagesActions} aria-label="Управление страницами">
            <TablePaginator filters={pages.filters} setFilters={pages.setFilters} total={pages.total} />
            <Button className={styles.pagesReset} color="danger" variant="outlined" onClick={pages.reset}><FilterOutlined />Сбросить</Button>
            {refreshAction}
            {normalizationAction}
          </div>}
          {activeTab === QUERIES && <div className={styles.pagesActions} aria-label="Управление запросами">
            <TablePaginator filters={queries.filters} setFilters={queries.setFilters} total={queries.total} />
            <Button className={styles.pagesReset} color="danger" variant="outlined" onClick={queries.reset}><FilterOutlined />Сбросить</Button>
            {refreshAction}
          </div>}
        </div>
      )}
      id="seo-tabs"
      role="region"
      aria-label="SEO"
      className={activeTab === PAGES || activeTab === QUERIES ? `${styles.tabs} ${styles.pagesTabs}` : styles.tabs}
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
    <ConfirmActionModal
      open={parseRefresh.open}
      title="Обновить данные?"
      text="Данные Яндекс.Метрики за последние дни будут загружены в фоне. Таблица не обновится мгновенно — свежие данные появятся после завершения загрузки."
      okText="Подтвердить"
      okDanger={false}
      okClassName={styles.refreshConfirm}
      pending={parseRefresh.pending}
      error={parseRefresh.error}
      onConfirm={parseRefresh.confirm}
      onCancel={parseRefresh.close}
    />
    </>
  );
}
