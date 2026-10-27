"use client";

import { useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Alert, Button, Result, Tooltip, type InputRef, type TableColumnType } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { MainTable } from "@/ui/MainTable";
import { StringFilter } from "@/ui/filters/StringFilter";
import { TablePaginator } from "@/ui/TablePaginator";
import type { useSeoPagesTable } from "../hooks/useSeoPagesTable";
import type { useSeoQueriesTable } from "../hooks/useSeoQueriesTable";
import type { useSeoDataTable } from "../hooks/useSeoDataTable";
import { useSeoStyles } from "./seoStyles";

const PAGES = "pages";
const ESCAPE = "Escape";
const ENTER = "Enter";
const SPACE = " ";
const PAGE_COLUMN_WIDTH = 300;

export type SeoDataTableProps = {
  table: ReturnType<typeof useSeoDataTable> | ReturnType<typeof useSeoPagesTable> | ReturnType<typeof useSeoQueriesTable>;
  additionalColumns?: TableColumnType<Record<PropertyKey, unknown>>[];
  dateOnly?: boolean;
  fixedColumns?: boolean;
  hidePagination?: boolean;
  filtersElements?: ReactNode;
};

export function SeoDataTable({ table, additionalColumns = [], dateOnly = false, fixedColumns = false, hidePagination = false, filtersElements }: SeoDataTableProps) {
  const { styles } = useSeoStyles();
  const panelRef = useRef<HTMLElement>(null);
  const sizingPopupRef = useRef<HTMLDivElement>(null);
  const field = table.resource === PAGES ? "page" : "query";
  const title = table.resource === PAGES ? "Страница" : "Запрос";
  const [open, setOpen] = useState(false);
  const focusPending = useRef(false);
  const inputRef = useCallback((input: InputRef | null) => {
    // AntD initially mounts portals before placing them in their container.
    // Wait until commit so the sizing portal cannot consume autofocus.
    queueMicrotask(() => {
      if (input?.input?.isConnected && focusPending.current && !input.input.closest("[hidden]")) {
        input.focus();
        focusPending.current = false;
      }
    });
  }, []);
  const handleOpenChange = (visible: boolean) => {
    focusPending.current = visible;
    setOpen(visible);
  };
  const triggerRef = useRef<HTMLElement | null>(null);
  const getPopupContainer = (trigger: HTMLElement) =>
    trigger.closest('.ant-table-measure-row[aria-hidden="true"]')
      ? sizingPopupRef.current ?? document.body
      : document.body;
  const handleSearch = (value: string | undefined) => table.changeSearch(value ?? "");
  const handleFilterKey = (event: KeyboardEvent) => {
    event.stopPropagation();
    if (event.key === ESCAPE) {
      event.preventDefault();
      handleOpenChange(false);
      triggerRef.current?.focus();
    }
  };
  // MainTable remounts on sort. Adapt only this SEO boundary, before paint.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const triggers = panel?.querySelectorAll<HTMLElement>(".ant-table-filter-trigger");
    const handleTriggerClick = (event: Event) => {
      event.stopPropagation();
      handleOpenChange(!open);
    };
    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (triggerRef.current?.contains(target)) return;
      if (target.closest(`[data-seo-filter="${table.resource}"]`)) return;
      handleOpenChange(false);
    };
    document.addEventListener("pointerdown", handleOutsidePointer);
    const handleTriggerKey = (event: globalThis.KeyboardEvent) => {
      event.stopPropagation();
      if (event.key === ENTER || event.key === SPACE) {
        event.preventDefault();
        handleOpenChange(!open);
      }
    };
    triggers?.forEach(trigger => {
      const sizing = !!trigger.closest('.ant-table-measure-row[aria-hidden="true"]');
      trigger.setAttribute("aria-label", `Фильтр: ${title}`);
      if (sizing) {
        // AntD's trigger is a span: remove its focusability altogether. Inert
        // additionally protects future interactive descendants of sizing clones.
        trigger.removeAttribute("tabindex");
        trigger.setAttribute("inert", "");
        trigger.setAttribute("aria-disabled", "true");
        if (trigger instanceof HTMLButtonElement) trigger.disabled = true;
        return;
      }
      trigger.tabIndex = 0;
      trigger.setAttribute("aria-expanded", String(open));
      triggerRef.current = trigger;
      trigger.addEventListener("keydown", handleTriggerKey);
      trigger.addEventListener("click", handleTriggerClick);
    });
    const body = panel?.querySelector<HTMLElement>(".ant-table-body");
    if (body) {
      body.tabIndex = 0;
      body.setAttribute("role", "region");
      body.setAttribute("aria-label", `Прокрутка: ${title}`);
    }
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      triggers?.forEach(trigger => {
        trigger.removeEventListener("keydown", handleTriggerKey);
        trigger.removeEventListener("click", handleTriggerClick);
      });
    };
  });
  const columns: TableColumnType<Record<PropertyKey, unknown>>[] = [
    {
      key: field, dataIndex: field, title, sorter: true,
      fixed: fixedColumns ? "left" : undefined, width: fixedColumns ? PAGE_COLUMN_WIDTH : undefined,
      filtered: Boolean(table.filters.search),
      filterIcon: <SearchOutlined />,
      // Both native headers share column props, including the hidden sizing
      // copy. Own click/outside handling so its popup cannot close the visible one.
      filterDropdownProps: { trigger: [], destroyOnHidden: true, open, getPopupContainer },
      filterDropdown: (
        <div data-seo-filter={table.resource} className={styles.dataFilter} onKeyDown={handleFilterKey}>
          <StringFilter value={table.searchDraft} onChange={handleSearch} trimOnChange={false}
            inputAriaLabel={`Поиск: ${title}`} inputRef={inputRef} />
        </div>
      ),
      render: (value: string) => <Tooltip title={value}><span className={fixedColumns ? styles.pageValue : styles.dataValue}>{value}</span></Tooltip>,
    },
    {
      key: "created_at", dataIndex: "created_at", title: "Создано", width: 180,
      fixed: fixedColumns ? "left" : undefined, sorter: dateOnly || undefined,
      render: (value: string) => <span className={styles.dataDate}>{dayjs(value).format(dateOnly ? "DD.MM.YYYY" : "DD.MM.YYYY HH:mm")}</span>,
    },
    ...additionalColumns,
  ];
  if (!table.allowed) return <Result status="403" title="Недостаточно прав" />;
  return (
    <section ref={panelRef} aria-label={table.resource === PAGES ? "Таблица страниц" : "Таблица запросов"} className={hidePagination ? `${styles.dataPanel} ${styles.pagesDataPanel}` : styles.dataPanel}>
      <div ref={sizingPopupRef} hidden inert aria-hidden="true" />
      {!hidePagination && <div className={styles.dataPagination}>
        <TablePaginator filters={table.filters as ReturnType<typeof useSeoDataTable>["filters"]} setFilters={table.setFilters as ReturnType<typeof useSeoDataTable>["setFilters"]} total={table.total} />
      </div>}
      {table.error ? (
        <Alert type="error" showIcon title={table.error} action={<Button onClick={table.retry}>Повторить</Button>} />
      ) : (
        <MainTable filtersElements={filtersElements} сolumns={columns} data={table.items.map(item => ({ ...item, key: item.id }))} loading={table.loading} currentSort={table.sort} onSortChange={table.changeSort} />
      )}
    </section>
  );
}
