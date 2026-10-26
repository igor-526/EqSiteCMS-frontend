"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SeoDataResource, SeoPageOutDto, SeoSearchQueryOutDto, SeoPagesOutDto, SeoSearchQueriesOutDto } from "@/types/api/seo";
import type { FiltersSetter } from "@/types/filters/filterBase";
import { isApiError } from "@/lib/apiStatus";
import { fetchSeoPages, fetchSeoSearchQueries, mapSeoPageOrdering, mapSeoQueryOrdering } from "../services/seoDataService";
import { SEO_ACTIONS, useSeoScopes } from "./useSeoScopes";

const PAGES = "pages";
const PAGE_FIELD = "page";
const QUERY_FIELD = "query";
const SEARCH_DELAY = 300;

export function useSeoDataTable(resource: SeoDataResource, active: boolean) {
  const { hasPermission } = useSeoScopes();
  const allowed = hasPermission(resource === PAGES ? SEO_ACTIONS.LIST_PAGES : SEO_ACTIONS.LIST_QUERIES);
  const [searchDraft, setSearchDraft] = useState("");
  const [filters, updateFilters] = useState({ limit: 25, offset: 0, search: undefined as string | undefined });
  const [sort, updateSort] = useState<string[]>([]);
  const [items, setItems] = useState<(SeoPageOutDto | SeoSearchQueryOutDto)[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const corrected = useRef(false);
  const access = useRef(allowed && active);
  access.current = allowed && active;

  const cancelSearch = useCallback(() => clearTimeout(timer.current), []);
  useEffect(() => cancelSearch, [cancelSearch]);
  useEffect(() => {
    if (!allowed) {
      cancelSearch();
      setSearchDraft("");
      updateFilters({ limit: 25, offset: 0, search: undefined });
      updateSort([]);
      setItems([]);
      setTotal(0);
      setError(null);
    }
  }, [allowed, cancelSearch]);

  const changeSearch = useCallback((draft: string) => {
    if (!access.current) return;
    cancelSearch();
    setSearchDraft(draft);
    const apply = () => {
      if (!access.current) return;
      corrected.current = false;
      updateFilters(previous => ({ ...previous, search: draft.trim() || undefined, offset: 0 }));
    };
    if (!draft) apply();
    else timer.current = setTimeout(apply, SEARCH_DELAY);
  }, [cancelSearch]);

  const setFilters: FiltersSetter<typeof filters> = useCallback((update) => {
    if (!access.current) return;
    corrected.current = false;
    updateFilters(previous => {
      // eslint-disable-next-line no-restricted-syntax -- TypeScript requires a literal typeof guard to narrow SetStateAction.
      const next = typeof update === "function" ? update(previous) : update;
      // Compare with the rendered paginator size, not an earlier queued update:
      // AntD calls both onShowSizeChange and onChange in the same event.
      return { ...previous, limit: next.limit, offset: next.limit === filters.limit ? next.offset : 0 };
    });
  }, [filters.limit]);

  const changeSort = useCallback((values: string[]) => {
    if (!access.current) return;
    const value = values[0];
    const field = resource === PAGES ? PAGE_FIELD : QUERY_FIELD;
    const mapped = value === field || value === `-${field}` ? value : undefined;
    updateSort(mapped ? [mapped] : []);
    corrected.current = false;
    updateFilters(previous => ({ ...previous, offset: 0 }));
  }, [resource]);
  const retry = useCallback(() => {
    if (access.current) setRevision(previous => previous + 1);
  }, []);

  useEffect(() => {
    cancelSearch();
    // A draft interrupted by a tab switch is resumed when the tab returns.
    if (active && allowed && searchDraft.trim() !== (filters.search ?? "")) {
      timer.current = setTimeout(() => {
        corrected.current = false;
        updateFilters(previous => ({ ...previous, search: searchDraft.trim() || undefined, offset: 0 }));
      }, SEARCH_DELAY);
    }
    return cancelSearch;
  }, [active, allowed, cancelSearch, searchDraft, filters.search]);

  useEffect(() => {
    const current = ++generation.current;
    if (!active || !allowed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const value = sort[0];
    const order = value?.startsWith("-") ? "descend" : "ascend";
    const request = resource === PAGES
      ? fetchSeoPages({ ...filters, ordering: mapSeoPageOrdering(value?.replace(/^-/, ""), order) })
      : fetchSeoSearchQueries({ ...filters, ordering: mapSeoQueryOrdering(value?.replace(/^-/, ""), order) });
    const isCurrent = () => current === generation.current && access.current;
    void request.then(result => {
      if (!isCurrent()) return;
      if (isApiError<SeoPagesOutDto | SeoSearchQueriesOutDto>(result)) {
        setError(result.data.detail);
        return;
      }
      const data = result.data ?? { items: [], total: 0 };
      const lastOffset = Math.max(0, Math.ceil(data.total / filters.limit) - 1) * filters.limit;
      if (!data.items.length && filters.offset > lastOffset && !corrected.current) {
        corrected.current = true;
        updateFilters(previous => ({ ...previous, offset: lastOffset }));
        return;
      }
      setItems(data.items);
      setTotal(data.total);
    }).catch(() => {
      if (isCurrent()) setError("Не удалось загрузить данные SEO");
    }).finally(() => {
      if (isCurrent()) setLoading(false);
    });
    return () => { generation.current += 1; };
  }, [active, allowed, resource, filters, sort, revision]);

  return {
    resource, allowed, searchDraft, changeSearch, filters, setFilters,
    sort, changeSort, items: allowed ? items : [], total: allowed ? total : 0,
    loading: allowed && loading, error: allowed ? error : null, retry,
  };
}
