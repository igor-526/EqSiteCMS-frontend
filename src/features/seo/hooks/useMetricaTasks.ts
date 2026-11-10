"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isApiError } from "@/lib/apiStatus";
import type { MetricaTaskOutDto } from "@/types/api/seo";
import { fetchMetricaTasks, METRICA_TASKS_ERROR } from "../services/metricaTasksService";
import { SEO_ACTIONS, useSeoScopes } from "./useSeoScopes";

const LIMITS = { DEFAULT: 20, MEDIUM: 50, MAX: 100 };
const allowedLimits = Object.values(LIMITS);
const initialPagination = { limit: LIMITS.DEFAULT, offset: 0 };

export function useMetricaTasks({ open, bindingKey }: { open: boolean; bindingKey: string | null }) {
  const { hasPermission } = useSeoScopes();
  const allowed = hasPermission(SEO_ACTIONS.LIST_METRICA_TASKS);
  const [sessionBinding, setSessionBinding] = useState<string | null>(null);
  const [pagination, setPagination] = useState(initialPagination);
  const [items, setItems] = useState<MetricaTaskOutDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const previousInputs = useRef({ open: false, bindingKey, allowed });
  const generation = useRef(0);
  const corrected = useRef(false);
  const skipEmptyRead = useRef(false);
  const active = open && allowed && bindingKey !== null && bindingKey === sessionBinding;
  const access = useRef({ active, bindingKey });
  access.current = { active, bindingKey };

  useEffect(() => () => {
    access.current = { active: false, bindingKey: null };
  }, []);

  useEffect(() => {
    const previous = previousInputs.current;
    const opening = open && !previous.open;
    previousInputs.current = { open, bindingKey, allowed };
    if (opening || !open || !allowed || bindingKey !== previous.bindingKey) {
      setSessionBinding(opening && allowed ? bindingKey : null);
      setPagination(initialPagination);
      setItems([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      corrected.current = false;
      skipEmptyRead.current = false;
    }
  }, [open, allowed, bindingKey]);

  const setOffset = useCallback((offset: number) => {
    if (!access.current.active || !Number.isInteger(offset) || offset < 0) return;
    corrected.current = false;
    setPagination(previous => ({ ...previous, offset }));
  }, []);
  const setLimit = useCallback((limit: number) => {
    if (!access.current.active || !allowedLimits.includes(limit)) return;
    corrected.current = false;
    setPagination({ limit, offset: 0 });
  }, []);
  const reload = useCallback(() => {
    if (!access.current.active) return;
    corrected.current = false;
    setRevision(previous => previous + 1);
  }, []);
  // F-2 calls this once after 202; batching gives exactly one GET even off page one.
  const reloadFromStart = useCallback(() => {
    if (!access.current.active) return;
    corrected.current = false;
    setPagination(previous => ({ ...previous, offset: 0 }));
    setRevision(previous => previous + 1);
  }, []);

  useEffect(() => {
    const current = ++generation.current;
    if (!active) return;
    if (skipEmptyRead.current) {
      skipEmptyRead.current = false;
      return;
    }
    const isCurrent = () => current === generation.current && access.current.active
      && access.current.bindingKey === bindingKey;
    setLoading(true);
    setError(null);
    setItems([]);
    void fetchMetricaTasks(pagination).then(result => {
      if (!isCurrent()) return;
      if (isApiError(result)) {
        setError(result.data.detail);
        return;
      }
      const data = result.data;
      if (!data) {
        setError(METRICA_TASKS_ERROR);
        return;
      }
      setTotal(data.total);
      const lastOffset = Math.max(0, Math.ceil(data.total / pagination.limit) - 1) * pagination.limit;
      if (data.total > 0 && pagination.offset > lastOffset && !corrected.current) {
        corrected.current = true;
        setPagination(previous => ({ ...previous, offset: lastOffset }));
        return;
      }
      if (data.total === 0 && pagination.offset !== 0) {
        // No extra GET for empty history: this response already describes offset zero.
        skipEmptyRead.current = true;
        setPagination(previous => ({ ...previous, offset: 0 }));
      }
      setItems(data.items);
    }).catch(() => {
      if (isCurrent()) setError(METRICA_TASKS_ERROR);
    }).finally(() => {
      if (isCurrent()) setLoading(false);
    });
    return () => { generation.current += 1; };
  }, [active, bindingKey, pagination, revision]);

  return {
    allowed, active, ...pagination, setOffset, setLimit,
    items: active ? items : [], total: active ? total : 0,
    loading: active && loading, error: active ? error : null,
    retry: reload, reload, reloadFromStart,
  };
}
