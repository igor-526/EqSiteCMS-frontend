"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isApiSuccess } from "@/lib/apiStatus";
import type { CallbackRequestOutDto, CallbackRequestsQuery, CallbackRequestStatusOutDto } from "@/types/api/callbackRequests";
import {
  fetchCallbackRequests,
  fetchCallbackRequestStatuses,
  updateCallbackRequestSpam,
  updateCallbackRequestStatus,
} from "../services/callbackRequestsService";

export const DEFAULT_CALLBACK_QUERY: CallbackRequestsQuery = {
  limit: 25, offset: 0, is_spam: [false], sort_by: "status", direction: "asc",
};

export const normalizeCallbackQuery = (query: CallbackRequestsQuery): CallbackRequestsQuery => {
  const normalized = Object.fromEntries(Object.entries(query).filter(([, value]) =>
    value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0),
  )) as CallbackRequestsQuery;
  for (const key of ["name", "phone", "comment"] as const) {
    if (typeof normalized[key] === "string") normalized[key] = normalized[key]!.trim() || undefined;
  }
  return normalized;
};

export const isAllowedPhoneRegex = (value: string) => !/[A-Za-zА-Яа-яЁё]/u.test(value);

export const mergeCallbackQuery = (current: CallbackRequestsQuery, patch: Partial<CallbackRequestsQuery>, resetOffset = true) =>
  normalizeCallbackQuery({ ...current, ...patch, ...(resetOffset ? { offset: 0 } : {}) });

export function useCallbackRequests(enabled = true) {
  const [rows, setRows] = useState<CallbackRequestOutDto[]>([]);
  const [statuses, setStatuses] = useState<CallbackRequestStatusOutDto[]>([]);
  const [query, setQueryState] = useState<CallbackRequestsQuery>(DEFAULT_CALLBACK_QUERY);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingKeys, setPendingKeys] = useState<string[]>([]);
  const pendingRef = useRef(new Set<string>());
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true); setError(null);
    const [listResult, statusesResult] = await Promise.all([
      fetchCallbackRequests(normalizeCallbackQuery(query)), fetchCallbackRequestStatuses(),
    ]);
    if (!mounted.current) return;
    if (isApiSuccess(listResult)) { setRows(listResult.data?.items ?? []); setTotal(listResult.data?.total ?? 0); }
    else setError(listResult.data.detail || "Не удалось загрузить заявки");
    if (isApiSuccess(statusesResult)) setStatuses(statusesResult.data ?? []);
    else setError(statusesResult.data.detail || "Не удалось загрузить статусы");
    setLoading(false);
  }, [enabled, query]);

  useEffect(() => { mounted.current = true; void load(); return () => { mounted.current = false; }; }, [load]);

  const setQuery = useCallback((patch: Partial<CallbackRequestsQuery>, resetOffset = true) => {
    setQueryState((current) => mergeCallbackQuery(current, patch, resetOffset));
  }, []);
  const resetQuery = useCallback(() => setQueryState(DEFAULT_CALLBACK_QUERY), []);
  const mutate = useCallback(async (key: string, action: () => ReturnType<typeof updateCallbackRequestStatus>) => {
    if (pendingRef.current.has(key)) return false;
    pendingRef.current.add(key);
    setPendingKeys([...pendingRef.current]); setError(null);
    try {
      const result = await action();
      if (isApiSuccess(result)) { await load(); return true; }
      setError(result.data.detail || "Не удалось изменить заявку"); return false;
    } finally {
      pendingRef.current.delete(key);
      setPendingKeys([...pendingRef.current]);
    }
  }, [load]);
  const changeStatus = useCallback((id: string, status: number) => mutate(`status:${id}`, () => updateCallbackRequestStatus(id, { status })), [mutate]);
  const changeSpam = useCallback((id: string, is_spam: boolean) => mutate(`spam:${id}`, () => updateCallbackRequestSpam(id, { is_spam })), [mutate]);

  return { rows, statuses, query, total, loading, error, pendingKeys, setQuery, resetQuery, reload: load, changeStatus, changeSpam };
}
