"use client";

import { useState } from "react";
import { FilterOutlined } from "@ant-design/icons";
import { Alert, Button, Pagination, Result, Space, Tabs } from "antd";
import { createStyles } from "antd-style";
import { PAGE_SIZES } from "@/lib/constants";
import { useCallbackRequestAccess } from "../hooks/useCallbackRequestAccess";
import { DEFAULT_CALLBACK_QUERY, useCallbackRequests } from "../hooks/useCallbackRequests";
import type { CallbackRequestOutDto } from "@/types/api/callbackRequests";
import { CallbackRequestDetailModal } from "./CallbackRequestDetailModal";
import { CallbackRequestsInstruction } from "./CallbackRequestsInstruction";
import { CallbackRequestsTable } from "./CallbackRequestsTable";

const useStyles = createStyles(({ css }) => ({
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 16px;
  `,
  tabs: css`
    min-width: 0;

    .ant-tabs-nav {
      margin-bottom: 0;
    }
  `,
  actions: css`
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-end;
    max-width: 100%;
    overflow-x: auto;
  `,
  content: css`
    width: 100%;
  `,
}));

const REQUESTS_TAB = "requests";
const INSTRUCTION_TAB = "instruction";

export function CallbackRequestsPage() {
  const { styles } = useStyles();
  const { canRead, canMutate } = useCallbackRequestAccess();
  const state = useCallbackRequests(canRead);
  const [tab, setTab] = useState(REQUESTS_TAB);
  const [selected, setSelected] = useState<CallbackRequestOutDto | null>(null);
  if (!canRead) return <Result status="403" title="403" subTitle="Недостаточно прав для просмотра заявок" />;
  const limit = state.query.limit ?? DEFAULT_CALLBACK_QUERY.limit ?? PAGE_SIZES[1];
  const offset = state.query.offset ?? 0;

  const handlePaginationChange = (page: number, pageSize: number) => {
    const nextOffset = pageSize === limit ? (page - 1) * pageSize : 0;
    state.setQuery({ limit: pageSize, offset: nextOffset }, false);
  };

  const actions = tab === REQUESTS_TAB ? <div className={styles.actions} data-testid="callback-requests-actions">
    <div data-testid="callback-requests-pagination">
      <Pagination aria-label="Пагинация заявок" current={Math.floor(offset / limit) + 1} total={state.total} pageSize={limit} showSizeChanger pageSizeOptions={[...PAGE_SIZES]} onChange={handlePaginationChange} />
    </div>
    <Button aria-label="Сбросить" color="danger" variant="outlined" onClick={state.resetQuery}>
      <FilterOutlined /> Сбросить
    </Button>
  </div> : null;

  return <>
    <div className={styles.header} data-testid="callback-requests-header">
      <Tabs className={styles.tabs} activeKey={tab} onChange={setTab} items={[{ key: REQUESTS_TAB, label: "Заявки" }, { key: INSTRUCTION_TAB, label: "Инструкция" }]} />
      {actions}
    </div>
    {tab === INSTRUCTION_TAB ? <CallbackRequestsInstruction /> : <Space className={styles.content} orientation="vertical" size="middle" data-testid="callback-requests-content">
      {state.error && <Alert type="error" showIcon message={state.error} />}
      <CallbackRequestsTable rows={state.rows} statuses={state.statuses} query={state.query} loading={state.loading} canMutate={canMutate} pendingKeys={state.pendingKeys} onFilterChange={(patch) => state.setQuery(patch)} onSelect={setSelected} onStatus={(id, status) => void state.changeStatus(id, status)} onSpam={(id, spam) => void state.changeSpam(id, spam)} onSort={(sort) => state.setQuery(sort ?? { sort_by: undefined, direction: undefined })} />
      <CallbackRequestDetailModal row={selected} statuses={state.statuses} onClose={() => setSelected(null)} />
    </Space>}
  </>;
}
