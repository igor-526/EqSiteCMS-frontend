"use client";

import { useEffect, useRef, useState } from "react";
import { isApiError } from "@/lib/apiStatus";
import { fetchYandexAuthLink } from "../services/seoService";
import { SEO_ACTIONS, useSeoScopes } from "./useSeoScopes";

const MESSAGE_TYPE = "eqsite:yandex-oauth";
const SUCCESS = "success";
const ERROR = "error";
const CANCELLED = "cancelled";
const CLOSED_POLL_MS = 500;

export function useYandexOAuthPopup(onRefresh: () => void | Promise<void>) {
  const { hasPermission } = useSeoScopes();
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popup = useRef<Window | null>(null);
  const opening = useRef(false);
  const mounted = useRef(false);
  const refresh = useRef(onRefresh);
  const permission = useRef(hasPermission);
  refresh.current = onRefresh;
  permission.current = hasPermission;

  useEffect(() => {
    mounted.current = true;
    const finish = (reload: boolean) => {
      popup.current = null;
      setWaiting(false);
      if (reload) void refresh.current();
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !popup.current || event.source !== popup.current) return;
      const data = event.data;
      if (data?.type !== MESSAGE_TYPE) return;
      if (![SUCCESS, ERROR, CANCELLED].includes(data.status)) return;
      if (data.status === ERROR) setError("Не удалось добавить аккаунт. Повторите авторизацию.");
      if (data.status === CANCELLED) setError("Авторизация отменена. Можно повторить попытку.");
      finish(data.status === SUCCESS);
    };
    window.addEventListener("message", onMessage);
    return () => {
      mounted.current = false;
      window.removeEventListener("message", onMessage);
      popup.current = null;
    };
  }, []);

  // Restart polling for subsequent attempts after a terminal message/closure.
  useEffect(() => {
    if (!waiting) return;
    const timer = setInterval(() => {
      if (!popup.current?.closed) return;
      popup.current = null;
      setWaiting(false);
      void refresh.current();
    }, CLOSED_POLL_MS);
    return () => clearInterval(timer);
  }, [waiting]);

  const openLink = (result: Awaited<ReturnType<typeof fetchYandexAuthLink>>) => {
    if (!permission.current(SEO_ACTIONS.GET_AUTH_LINK)) {
      setError("Недостаточно прав. Требуется роль ADMIN.");
    } else if (isApiError(result) || !result.data?.auth_link) {
      setError("Не удалось получить ссылку авторизации. Повторите попытку.");
    } else {
      popup.current = window.open(result.data.auth_link, "eqsite-yandex-oauth", "popup,width=600,height=700");
      if (!popup.current) setError("Всплывающее окно заблокировано. Разрешите всплывающие окна и повторите попытку.");
    }
  };

  const open = async () => {
    if (!permission.current(SEO_ACTIONS.GET_AUTH_LINK)) {
      setError("Недостаточно прав. Требуется роль ADMIN.");
      return;
    }
    if (popup.current && !popup.current.closed) {
      popup.current.focus();
      return;
    }
    if (opening.current) return;
    opening.current = true;
    setWaiting(true);
    setError(null);
    try {
      const result = await fetchYandexAuthLink();
      if (!mounted.current) return;
      openLink(result);
    } catch {
      if (mounted.current) setError("Не удалось открыть авторизацию. Повторите попытку.");
    } finally {
      opening.current = false;
      if (mounted.current && !popup.current) setWaiting(false);
    }
  };
  return { open, waiting, error };
}
