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

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    if (!hasPermission(SEO_ACTIONS.GET_CONNECTION)) {
      setLoading(false);
      setConnection(null);
      setError("Недостаточно прав");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMetricaConnection();
      if (currentRequest !== requestId.current) return;
      if (isApiError(result)) setError(result.data.detail);
      else if (result.data) setConnection(result.data.counter);
      else setError("Не удалось загрузить привязку");
    } catch {
      if (currentRequest === requestId.current) setError("Не удалось загрузить привязку");
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [hasPermission]);

  useEffect(() => {
    void refresh();
    return () => { requestId.current += 1; };
  }, [refresh]);

  const unlinkCounter = async () => {
    if (submitting.current) return;
    if (!hasPermission(SEO_ACTIONS.UNLINK_COUNTER)) {
      setMutationError("Недостаточно прав");
      return;
    }
    submitting.current = true;
    setPending(true);
    setMutationError(null);
    try {
      const result = await unlinkMetricaCounter();
      if (isApiError(result)) {
        setMutationError(result.data.detail);
        return;
      }
      setConfirmOpen(false);
      notification.success({ title: "Счётчик отвязан" });
      await refresh();
    } catch {
      setMutationError("Не удалось отвязать счётчик");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };

  const openConfirmation = () => {
    if (!hasPermission(SEO_ACTIONS.UNLINK_COUNTER)) return;
    setMutationError(null);
    setConfirmOpen(true);
  };
  const closeConfirmation = () => {
    if (!submitting.current) setConfirmOpen(false);
  };
  const openWizard = () => {
    if (hasPermission(SEO_ACTIONS.BIND_COUNTER)) setWizardOpen(true);
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
