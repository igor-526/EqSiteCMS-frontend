"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { isApiError } from "@/lib/apiStatus";
import type { YandexAccountOutDto } from "@/types/api/yandex";
import { fetchYandexAccounts, unlinkYandexAccount } from "../services/seoService";
import { SEO_ACTIONS, useSeoScopes } from "./useSeoScopes";
import type { WizardAccountStepProps } from "../ui/ConnectionWizardModal";

// ApiResult exposes detail, not HTTP status. Keep the server detail for diagnostics.
export function yandexErrorMessage(detail: string): string {
  if (/forbidden|403|недостаточно прав/i.test(detail)) return "Недостаточно прав. Требуется роль SEO.";
  if (/unauthorized|401|not authenticated|authentication (?:failed|required)/i.test(detail)) return "Сессия истекла. Войдите в CMS повторно.";
  if (/not found|404|не найден/i.test(detail)) return "Аккаунт или ресурс уже отсутствует. Обновите список.";
  return detail;
}

function mergeAccounts(existing: YandexAccountOutDto[], incoming: YandexAccountOutDto[]) {
  const seen = new Set<string>();
  return [...existing, ...incoming].filter((account) => {
    if (seen.has(account.id)) return false;
    seen.add(account.id);
    return true;
  });
}

export function useYandexAccounts({ selectedAccount, onSelect, onConnectionChange }: WizardAccountStepProps) {
  const { hasPermission } = useSeoScopes();
  const notification = useNotification();
  const canRead = hasPermission(SEO_ACTIONS.LIST_ACCOUNTS);
  const canUnlink = hasPermission(SEO_ACTIONS.UNLINK_ACCOUNT);
  const canAdd = hasPermission(SEO_ACTIONS.GET_AUTH_LINK);
  const [accounts, setAccounts] = useState<YandexAccountOutDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(canRead);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<YandexAccountOutDto | null>(null);
  const requestId = useRef(0);
  const permission = useRef(hasPermission);
  permission.current = hasPermission;
  // Revoke/regrant starts a new access lifetime; old responses stay invalid.
  const access = useRef({ allowed: canRead, version: 0 });
  if (access.current.allowed !== canRead) {
    access.current = { allowed: canRead, version: access.current.version + 1 };
  }
  useEffect(() => () => { access.current.version += 1; }, []);

  const submitting = useRef(false);
  const reading = useRef(false);
  const loaded = useRef(0);

  useEffect(() => {
    if (canRead) return;
    setAccounts([]);
    setTotal(0);
    loaded.current = 0;
    setConfirmation(null);
    setMutationError(null);
  }, [canRead]);

  const load = useCallback(async (offset: number) => {
    const version = access.current.version;
    const request = ++requestId.current;
    if (!canRead || !permission.current(SEO_ACTIONS.LIST_ACCOUNTS)) {
      setAccounts([]);
      setLoading(false);
      setError("Недостаточно прав");
      return;
    }
    reading.current = true;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchYandexAccounts({ limit: 20, offset });
      if (request !== requestId.current || version !== access.current.version) return;
      if (isApiError(result)) setError(yandexErrorMessage(result.data.detail));
      else if (result.data) {
        const items = result.data.items;
        // The peer cursor counts raw items, not the deduplicated visible accounts.
        loaded.current = offset + items.length;
        setAccounts((previous) => mergeAccounts(offset === 0 ? [] : previous, items));
        setTotal(result.data.total);
      } else setError("Не удалось загрузить аккаунты");
    } catch {
      if (request === requestId.current && version === access.current.version) setError("Не удалось загрузить аккаунты");
    } finally {
      if (request === requestId.current && version === access.current.version) {
        reading.current = false;
        setLoading(false);
      }
    }
  }, [canRead]);
  const refresh = useCallback(() => load(0), [load]);
  const loadMore = () => {
    if (!reading.current && loaded.current < total) void load(loaded.current);
  };
  useEffect(() => {
    void refresh();
    return () => { requestId.current += 1; };
  }, [refresh]);

  const openConfirmation = (account: YandexAccountOutDto) => {
    if (!permission.current(SEO_ACTIONS.UNLINK_ACCOUNT) || submitting.current) return;
    setMutationError(null);
    setConfirmation(account);
  };
  const closeConfirmation = () => {
    if (!submitting.current) setConfirmation(null);
  };
  const unlinkAccount = async () => {
    if (submitting.current) return;
    if (!permission.current(SEO_ACTIONS.UNLINK_ACCOUNT)) {
      setMutationError("Недостаточно прав");
      return;
    }
    if (!confirmation) return;
    const version = access.current.version;
    submitting.current = true;
    setPending(true);
    setMutationError(null);
    try {
      const result = await unlinkYandexAccount(confirmation.id);
      if (version !== access.current.version) return;
      if (isApiError(result)) {
        setMutationError(yandexErrorMessage(result.data.detail));
        // Refresh even when status is unavailable (including an already removed account).
        await refresh();
        return;
      }
      if (selectedAccount?.id === confirmation.id) onSelect(null);
      setConfirmation(null);
      notification.success({ title: "Аккаунт отвязан" });
      onConnectionChange();
      await refresh();
    } catch {
      if (version === access.current.version) setMutationError("Не удалось отвязать аккаунт");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };
  const selectAccount = (account: YandexAccountOutDto) => {
    if (permission.current(SEO_ACTIONS.LIST_ACCOUNTS) && !submitting.current) onSelect(account);
  };
  return {
    accounts, total, loading, error, refresh, loadMore,
    canRead, canUnlink, canAdd, pending, mutationError, confirmation,
    openConfirmation, closeConfirmation, unlinkAccount, selectAccount,
  };
}
