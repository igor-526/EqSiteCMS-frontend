"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useDebounce } from "@/hooks/useDebounce";
import { useNotification } from "@/hooks/useNotification";
import { isApiError } from "@/lib/apiStatus";
import type { YandexMetricaCounterOutDto } from "@/types/api/yandex";
import type { WizardTargetStepProps } from "../ui/ConnectionWizardModal";
import { bindMetricaCounter, fetchMetricaCounters } from "../services/seoService";
import { SEO_ACTIONS, useSeoScopes } from "./useSeoScopes";
import { yandexErrorMessage } from "./useYandexAccounts";

const SEARCH_DEBOUNCE_MS = 300;

const bindingSchema = z.object({
  yandex_account_id: z.string().min(1),
  counter_id: z.string().regex(/^\d{1,31}$/),
});

export function useMetricaCounters({ account, onDone, onPendingChange }: Pick<WizardTargetStepProps, "account" | "onDone" | "onPendingChange">) {
  const { hasPermission } = useSeoScopes();
  const notification = useNotification();
  const canRead = hasPermission(SEO_ACTIONS.LIST_COUNTERS);
  const canBind = hasPermission(SEO_ACTIONS.BIND_COUNTER);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const [pagination, setPagination] = useState({ limit: 20, offset: 0, search: "" });
  const [counters, setCounters] = useState<YandexMetricaCounterOutDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(canRead);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const submitting = useRef(false);
  const requestId = useRef(0);
  const permission = useRef(hasPermission);
  permission.current = hasPermission;
  // Revoke/regrant starts a new access lifetime; old responses stay invalid.
  const access = useRef({ allowed: canRead, version: 0 });
  if (access.current.allowed !== canRead) {
    access.current = { allowed: canRead, version: access.current.version + 1 };
  }
  useEffect(() => () => { access.current.version += 1; }, []);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (submitting.current) onPendingChange(false);
    };
  }, [onPendingChange]);
  // Derive offset before the request effect, avoiding a stale-page search request.
  const offset = pagination.search === debouncedSearch ? pagination.offset : 0;
  useEffect(() => {
    setPagination((previous) => previous.search === debouncedSearch ? previous : {
      ...previous, search: debouncedSearch, offset: 0,
    });
  }, [debouncedSearch]);

  useEffect(() => {
    if (canRead) return;
    setCounters([]);
    setTotal(0);
    setMutationError(null);
  }, [canRead]);

  const refresh = useCallback(async () => {
    const version = access.current.version;
    const request = ++requestId.current;
    if (!canRead || !permission.current(SEO_ACTIONS.LIST_COUNTERS)) {
      setCounters([]);
      setLoading(false);
      setError("Недостаточно прав");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMetricaCounters({
        account_id: account.id, limit: pagination.limit, offset,
        search: debouncedSearch.trim() || undefined,
      });
      if (request !== requestId.current || version !== access.current.version) return;
      if (isApiError(result)) setError(yandexErrorMessage(result.data.detail));
      else if (result.data) {
        setCounters(result.data.items);
        setTotal(result.data.total);
      } else setError("Не удалось загрузить счётчики");
    } catch {
      if (request === requestId.current && version === access.current.version) setError("Не удалось загрузить счётчики");
    } finally {
      if (request === requestId.current && version === access.current.version) setLoading(false);
    }
  }, [account.id, debouncedSearch, canRead, pagination.limit, offset]);

  useEffect(() => {
    void refresh();
    return () => { requestId.current += 1; };
  }, [refresh]);
  const changeSearch = (value: string) => {
    if (!submitting.current && permission.current(SEO_ACTIONS.LIST_COUNTERS)) setSearch(value);
  };
  const changePage = (page: number, pageSize: number) => {
    if (submitting.current || !permission.current(SEO_ACTIONS.LIST_COUNTERS)) return;
    setPagination((previous) => ({
      search: debouncedSearch,
      limit: pageSize, offset: previous.limit === pageSize ? (page - 1) * pageSize : 0,
    }));
  };
  const bindCounter = async (counterId: number) => {
    if (submitting.current) return;
    if (!permission.current(SEO_ACTIONS.BIND_COUNTER)) {
      setMutationError("Недостаточно прав");
      return;
    }
    const parsed = bindingSchema.safeParse({
      yandex_account_id: account.id, counter_id: String(counterId),
    });
    if (!parsed.success) {
      setMutationError("Выберите корректный счётчик");
      return;
    }
    const version = access.current.version;
    submitting.current = true;
    setPending(true);
    setMutationError(null);
    onPendingChange(true);
    try {
      // Recheck the latest render's permission immediately before the mutation.
      if (!permission.current(SEO_ACTIONS.BIND_COUNTER)) {
        setMutationError("Недостаточно прав");
        return;
      }
      const result = await bindMetricaCounter(parsed.data);
      if (version !== access.current.version) return;
      if (!mounted.current) return;
      if (isApiError(result)) {
        setMutationError(yandexErrorMessage(result.data.detail));
        return;
      }
      notification.success({ title: "Счётчик привязан" });
      onDone();
    } catch {
      if (mounted.current && version === access.current.version) setMutationError("Не удалось привязать счётчик");
    } finally {
      submitting.current = false;
      if (mounted.current) {
        setPending(false);
        onPendingChange(false);
      }
    }
  };
  return {
    counters, total, loading, error, refresh, search, changeSearch, changePage,
    limit: pagination.limit, offset,
    canRead, canBind, pending, mutationError, bindCounter,
  };
}
