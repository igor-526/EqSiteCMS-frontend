"use client";

import type { ChangeEvent } from "react";
import { Alert, Button, Empty, Input, Pagination, Space, Spin, Typography } from "antd";
import { useSeoStyles } from "./seoStyles";
import { useMetricaCounters } from "../hooks/useMetricaCounters";
import type { WizardTargetStepProps } from "./ConnectionWizardModal";

const DEFAULT_PAGE_SIZE = 20;
const MEDIUM_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const PAGE_SIZE_OPTIONS = [DEFAULT_PAGE_SIZE, MEDIUM_PAGE_SIZE, MAX_PAGE_SIZE];

export function MetricaCounterStep(props: WizardTargetStepProps) {
  const { styles } = useSeoStyles();
  const state = useMetricaCounters(props);
  const changeSearch = (event: ChangeEvent<HTMLInputElement>) => state.changeSearch(event.target.value);
  const busy = state.pending || props.busy;
  const rowsDisabled = !state.canBind || state.loading || !!state.error || busy;
  const readDisabled = !state.canRead || state.loading || busy;
  const currentPage = Math.floor(state.offset / state.limit) + 1;

  return (
    <Space orientation="vertical" size="middle" className={styles.stepContent} aria-busy={busy}>
      <Input aria-label="Поиск счётчиков" placeholder="Поиск счётчиков" value={state.search} onChange={changeSearch} disabled={!state.canRead || busy} allowClear />
      {state.loading && <Spin tip="Загрузка счётчиков"><span>Загрузка счётчиков</span></Spin>}
      {state.error && <Alert type="error" title={state.error} showIcon action={
        <Button onClick={state.refresh} disabled={readDisabled}>Повторить загрузку</Button>
      } />}
      {!state.loading && !state.error && state.counters.length === 0 && <Empty description="Счётчики не найдены" />}
      {state.counters.length > 0 && <ul className={styles.compactList} aria-label="Счётчики Метрики">
        {state.counters.map((counter) => (
          <li className={styles.compactRow} key={counter.counter_id}>
            <Button type="text" className={styles.rowAction} disabled={rowsDisabled} onClick={() => state.bindCounter(counter.counter_id)}>
              <span className={styles.rowDetails}>
                <Typography.Text>{counter.counter_id}</Typography.Text>
                <Typography.Text type="secondary">{counter.site}</Typography.Text>
              </span>
            </Button>
          </li>
        ))}
      </ul>}
      <Pagination className={styles.counterPagination} current={currentPage} pageSize={state.limit} total={state.total} onChange={state.changePage} showSizeChanger pageSizeOptions={PAGE_SIZE_OPTIONS} disabled={readDisabled} />
      {busy && <Spin tip="Привязка счётчика"><span role="status">Привязка счётчика</span></Spin>}
      {state.mutationError && <Alert type="error" title={state.mutationError} showIcon />}
    </Space>
  );
}
