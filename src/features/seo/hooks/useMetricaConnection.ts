"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { isApiError } from "@/lib/apiStatus";
import type { YandexMetricaConnectionOutDto } from "@/types/api/yandex";
import { fetchMetricaConnection, unlinkMetricaCounter } from "../services/seoService";
import { SEO_ACTIONS, useSeoScopes } from "./useSeoScopes";

export function useMetricaConnection() {
  const { hasPermission } = useSeoScopes();
  const notification = useNotification();
  const canRead = hasPermission(SEO_ACTIONS.GET_CONNECTION);
  const canBind = hasPermission(SEO_ACTIONS.BIND_COUNTER);
  const canUnlink = hasPermission(SEO_ACTIONS.UNLINK_COUNTER);
  const [connection, setConnection] = useState<YandexMetricaConnectionOutDto | null>(null);
  const [loading, setLoading] = useState(canRead);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
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

  useEffect(() => {
    if (canRead) return;
    setConnection(null);
    setConfirmOpen(false);
    setWizardOpen(false);
    setMutationError(null);
  }, [canRead]);

  const refresh = useCallback(async () => {
    const version = access.current.version;
    const currentRequest = ++requestId.current;
    if (!canRead || !permission.current(SEO_ACTIONS.GET_CONNECTION)) {
      setLoading(false);
      setConnection(null);
      setError("Недостаточно прав");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMetricaConnection();
      if (currentRequest !== requestId.current || version !== access.current.version) return;
      if (isApiError(result)) setError(result.data.detail);
      else if (result.data) setConnection(result.data.counter);
      else setError("Не удалось загрузить привязку");
    } catch {
      if (currentRequest === requestId.current && version === access.current.version) setError("Не удалось загрузить привязку");
    } finally {
      if (currentRequest === requestId.current && version === access.current.version) setLoading(false);
    }
  }, [canRead]);

  useEffect(() => {
    void refresh();
    return () => { requestId.current += 1; };
  }, [refresh]);

  const unlinkCounter = async () => {
    if (submitting.current) return;
    if (!permission.current(SEO_ACTIONS.UNLINK_COUNTER)) {
      setMutationError("Недостаточно прав");
      return;
    }
    const version = access.current.version;
    submitting.current = true;
    setPending(true);
    setMutationError(null);
    try {
      const result = await unlinkMetricaCounter();
      if (version !== access.current.version) return;
      if (isApiError(result)) {
        setMutationError(result.data.detail);
        return;
      }
      setConfirmOpen(false);
      notification.success({ title: "Счётчик отвязан" });
      await refresh();
    } catch {
      if (version === access.current.version) setMutationError("Не удалось отвязать счётчик");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };

  const openConfirmation = () => {
    if (!permission.current(SEO_ACTIONS.UNLINK_COUNTER)) return;
    setMutationError(null);
    setConfirmOpen(true);
  };
  const closeConfirmation = () => {
    if (!submitting.current) setConfirmOpen(false);
  };
  const openWizard = () => {
    if (permission.current(SEO_ACTIONS.BIND_COUNTER)) setWizardOpen(true);
  };
  const closeWizard = () => setWizardOpen(false);
  const completeWizard = () => {
    setWizardOpen(false);
    void refresh();
  };

  return {
    connection, loading, error, pending, mutationError,
    canRead, canBind, canUnlink, refresh, unlinkCounter,
    confirmOpen, openConfirmation, closeConfirmation,
    wizardOpen, openWizard, closeWizard, completeWizard,
  };
}
