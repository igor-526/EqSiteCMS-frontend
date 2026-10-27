"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { message } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { MetricsMode, MetricsTableOutDto, PageMetric } from "@/types/api/metricsTable";
import type { SeoPageOutDto, SeoPagesFilters, SeoPagesQueryInDto } from "@/types/api/seo";
import type { FiltersSetter } from "@/types/filters/filterBase";
import { isApiError } from "@/lib/apiStatus";
import { fetchSeoPages, mapSeoPageOrdering } from "../services/seoDataService";
import { isPageMetricsDateDisabled, pageMetricsLimits, pageMetricsPickerDates } from "../services/pageMetricsOptions";
import { SEO_ACTIONS, useSeoScopes } from "./useSeoScopes";

const initialFilters: SeoPagesFilters = { limit: 25, offset: 0, mode: "day", metric: "visits" };
const SEARCH_DELAY = 300;

export function useSeoPagesTable(active: boolean) {
  const { hasPermission } = useSeoScopes();
  const allowed = hasPermission(SEO_ACTIONS.LIST_PAGES);
  const [filters, updateFilters] = useState(initialFilters);
  const [sort, updateSort] = useState<string[]>([]);
  const [searchDraft, setSearchDraft] = useState("");
  const [request, setRequest] = useState<SeoPagesQueryInDto>({ limit: 25, offset: 0, mode: "day", metric: "visits" });
  const [items, setItems] = useState<SeoPageOutDto[]>([]);
  const [metricsTable, setMetricsTable] = useState<MetricsTableOutDto | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentFilters = useRef(filters);
  const currentSort = useRef(sort);
  const generation = useRef(0);
  const access = useRef(false);
  access.current = active && allowed;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancelSearch = useCallback(() => clearTimeout(timer.current), []);
  useEffect(() => cancelSearch, [cancelSearch]);

  // Only user actions schedule requests; server-normalized dates/sort update display state alone.
  const commit = useCallback((next: SeoPagesFilters, nextSort = currentSort.current) => {
    if (!access.current) return;
    generation.current += 1;
    currentFilters.current = next;
    currentSort.current = nextSort;
    updateFilters(next);
    updateSort(nextSort);
    setRequest({ limit: next.limit, offset: next.offset, search: next.search,
      mode: next.mode, metric: next.metric, date_from: next.dateFrom, date_to: next.dateTo,
      ordering: mapSeoPageOrdering(nextSort[0]?.replace(/^-/, ""), nextSort[0]?.startsWith("-") ? "descend" : "ascend") });
  }, []);
  useEffect(() => {
    if (!allowed) {
      cancelSearch();
      currentFilters.current = initialFilters;
      currentSort.current = [];
      updateFilters(initialFilters);
      updateSort([]);
      setSearchDraft("");
      setItems([]);
      setMetricsTable(null);
      setTotal(0);
      setError(null);
      setRequest({ limit: 25, offset: 0, mode: "day", metric: "visits" });
    }
  }, [allowed, cancelSearch]);

  const changeSearch = useCallback((draft: string) => {
    if (!access.current) return;
    cancelSearch();
    setSearchDraft(draft);
    if (!draft) commit({ ...currentFilters.current, search: undefined, offset: 0 });
  }, [cancelSearch, commit]);
  useEffect(() => {
    cancelSearch();
    if (active && allowed && searchDraft.trim() !== (filters.search ?? "")) {
      timer.current = setTimeout(() => commit({ ...currentFilters.current, search: searchDraft.trim() || undefined, offset: 0 }), SEARCH_DELAY);
    }
    return cancelSearch;
  }, [active, allowed, searchDraft, filters.search, cancelSearch, commit]);

  const setFilters: FiltersSetter<SeoPagesFilters> = useCallback(update => {
    if (!access.current) return;
    // eslint-disable-next-line no-restricted-syntax -- Narrow React SetStateAction.
    const next = typeof update === "function" ? update(currentFilters.current) : update;
    commit({ ...currentFilters.current, limit: next.limit, offset: next.limit === filters.limit ? next.offset : 0 });
  }, [commit, filters.limit]);
  const changeSort = useCallback((values: string[]) => {
    const value = values[0];
    const mapped = mapSeoPageOrdering(value?.replace(/^-/, ""), value?.startsWith("-") ? "descend" : "ascend");
    commit({ ...currentFilters.current, offset: 0 }, mapped ? [mapped] : []);
  }, [commit]);
  const withoutMetricSort = () => currentSort.current.filter(value => !value.replace(/^-/, "").startsWith("metric:"));
  const changeMode = (mode: MetricsMode) => commit({ ...currentFilters.current, mode, dateFrom: undefined, dateTo: undefined, offset: 0 }, withoutMetricSort());
  const changeMetric = (metric: PageMetric) => commit({ ...currentFilters.current, metric, offset: 0 });
  const today = metricsTable?.period.today ?? dayjs().format("YYYY-MM-DD");
  const changeDates = (range: readonly [Dayjs, Dayjs] | null) => {
    const dates = pageMetricsPickerDates(range, currentFilters.current.mode, today);
    if (dates) commit({ ...currentFilters.current, ...dates, offset: 0 }, withoutMetricSort());
  };
  const reset = () => {
    if (!access.current) return;
    cancelSearch();
    setSearchDraft("");
    commit({ ...currentFilters.current, search: undefined, offset: 0 }, []);
  };
  const retry = () => commit(currentFilters.current);

  useEffect(() => {
    const current = ++generation.current;
    if (!active || !allowed) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const isCurrent = () => current === generation.current && access.current;
    void fetchSeoPages(request).then(result => {
      if (!isCurrent()) return;
      if (isApiError(result)) { setError(result.data.detail); return; }
      if (!result.data?.metrics_table) { setError("Не удалось загрузить метрики страниц"); return; }
      const data = result.data;
      const table = data.metrics_table;
      const next = { ...currentFilters.current, dateFrom: table.period.date_from, dateTo: table.period.date_to };
      currentFilters.current = next;
      currentSort.current = table.ordering ? [table.ordering] : [];
      updateFilters(next);
      updateSort(currentSort.current);
      setItems(data.items);
      setTotal(data.total);
      setMetricsTable(table);
      if (table.period.clamped) {
        void message.warning(`Диапазон сокращён до лимита «${pageMetricsLimits[table.period.mode]}»: ${dayjs(table.period.date_from).format("DD.MM.YYYY")} – ${dayjs(table.period.date_to).format("DD.MM.YYYY")}`);
      }
    }).catch(() => {
      if (isCurrent()) setError("Не удалось загрузить данные SEO");
    }).finally(() => {
      if (isCurrent()) setLoading(false);
    });
    return () => { generation.current += 1; };
  }, [active, allowed, request]);

  return { resource: "pages" as const, allowed, filters, setFilters, sort, changeSort,
    searchDraft, changeSearch, changeMode, changeMetric, changeDates, reset, retry, today,
    disabledDate: (date: Dayjs) => isPageMetricsDateDisabled(date, filters.mode, today),
    items: allowed ? items : [], total: allowed ? total : 0, metricsTable: allowed ? metricsTable : null,
    loading: allowed && loading, error: allowed ? error : null };
}
