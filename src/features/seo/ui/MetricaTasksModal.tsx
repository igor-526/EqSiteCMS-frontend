"use client";

import { useEffect, useRef } from "react";
import { Alert, Button, Empty, Modal, Spin, Typography, type TableColumnType } from "antd";
import { MainTable } from "@/ui/MainTable";
import { TablePaginator } from "@/ui/TablePaginator";
import type { MetricaTaskOutDto } from "@/types/api/seo";
import type { useMetricaTasksDialog } from "../hooks/useMetricaTasksDialog";
import { ConfirmActionModal } from "./ConfirmActionModal";
import { useSeoStyles } from "./seoStyles";

const MODAL_WIDTH = 1040;
const TASK_LIMITS = { DEFAULT: 20, MEDIUM: 50, MAX: 100 };
const typeLabels: Record<MetricaTaskOutDto["type"], string> = {
  parsing: "Парсинг метрик", merge: "Слияние метрик страниц", delete: "Удаление данных",
};
const statusLabels: Record<MetricaTaskOutDto["status"], string> = {
  queued: "В очереди", running: "Выполняется", succeeded: "Завершено",
  failed: "Ошибка", cancelled: "Отменено",
};
const dateFormat = new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" });
const columns: TableColumnType<Record<PropertyKey, unknown>>[] = [
  { key: "type", dataIndex: "type", title: "Тип", width: 300, render: (type: MetricaTaskOutDto["type"]) => typeLabels[type] },
  { key: "status", dataIndex: "status", title: "Статус", width: 360, render: (status: MetricaTaskOutDto["status"]) => statusLabels[status] },
  { key: "created_at", dataIndex: "created_at", title: "Создано", width: 220,
    render: (value: string) => <time dateTime={value}>{dateFormat.format(new Date(value))}</time> },
];

type Model = ReturnType<typeof useMetricaTasksDialog>;

export function MetricaTasksModal({ model }: { model: Model }) {
  const { styles } = useSeoStyles();
  const { tasks, parse } = model;
  const wasConfirmOpen = useRef(false);
  const tableRegion = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // AntD exposes no props for its fixed-header scroll div. Keep this adapter
    // local: focusing the outer history region does not allow native table scroll.
    const body = tableRegion.current?.querySelector<HTMLElement>(".ant-table-body");
    if (!body) return;
    body.tabIndex = 0;
    body.setAttribute("role", "region");
    body.setAttribute("aria-label", "Прокрутка истории задач");
    return () => {
      body.removeAttribute("tabindex");
      body.removeAttribute("role");
      body.removeAttribute("aria-label");
    };
  }, [model.open, tasks.items, tasks.loading, tasks.error]);
  useEffect(() => {
    if (wasConfirmOpen.current && !parse.open && model.open) model.restoreRefreshFocus();
    wasConfirmOpen.current = parse.open;
  }, [parse.open, model]);
  if (!model.open) return null;
  const blocked = parse.open || parse.pending;
  const paginationDisabled = blocked || tasks.loading;
  let content;
  if (tasks.loading) content = <Spin><span role="status">Загрузка задач</span></Spin>;
  else if (tasks.error) content = <Alert type="error" showIcon title={tasks.error}
    action={<Button onClick={tasks.retry} disabled={blocked}>Повторить</Button>} />;
  else if (!tasks.items.length) content = <Empty description={<span className={styles.tasksEmptyDescription}>Задач пока нет</span>} />;
  else content = <MainTable сolumns={columns} data={tasks.items.map(item => ({ ...item, key: item.id }))} loading={false}
    filtersElements={<span className={styles.srOnly}>Список задач</span>} />;

  return (
    <>
      <Modal open title="Задачи Яндекс.Метрики" width={MODAL_WIDTH} centered
        classNames={{ body: styles.tasksBody }}
        onCancel={model.close} closable={!blocked} keyboard={!blocked} maskClosable={!blocked}
        footer={<Button onClick={model.close} disabled={blocked}>Закрыть</Button>} destroyOnHidden>
        <Typography.Paragraph>История задач конюшни, включая предыдущие привязки</Typography.Paragraph>
        <div className={styles.tasksActions}>
          <Button onClick={tasks.reload} disabled={blocked || tasks.loading}>Обновить список</Button>
          {parse.canStart && <Button ref={model.refreshTrigger} onClick={parse.show} disabled={blocked}>Обновить данные</Button>}
        </div>
        {model.accepted && <Alert type="info" showIcon title="Задача появится после получения команды сервисом Метрики. Обновите список" />}
        <fieldset className={styles.tasksPagination} disabled={paginationDisabled} aria-label="Пагинация задач"
          inert={paginationDisabled}>
          <TablePaginator filters={{ limit: tasks.limit, offset: tasks.offset }} setFilters={model.setFilters}
            total={tasks.total} pageSizeOptions={Object.values(TASK_LIMITS)} />
        </fieldset>
        <div ref={tableRegion} className={styles.tasksTable} role="region" aria-label="История задач" aria-busy={tasks.loading}>{content}</div>
      </Modal>
      <ConfirmActionModal open={parse.open} title="Обновить данные?"
        text="Данные Яндекс.Метрики за последние дни будут загружены в фоне. Свежие данные появятся после завершения загрузки."
        okText="Подтвердить" okDanger={false} okClassName={styles.refreshConfirm} isolateEscape
        pending={parse.pending} error={parse.error} onConfirm={parse.confirm} onCancel={model.cancelConfirmation} />
    </>
  );
}
