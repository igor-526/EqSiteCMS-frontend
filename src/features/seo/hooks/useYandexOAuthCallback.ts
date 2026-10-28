"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUserContext } from "@/contexts/UserContext";
import { isApiError } from "@/lib/apiStatus";
import { submitYandexAuthCode } from "../services/seoService";
import { SEO_ACTIONS, useSeoScopes } from "./useSeoScopes";

const SUCCESS = "success";

export function useYandexOAuthCallback() {
  const params = useSearchParams();
  const { user, loading } = useUserContext();
  const { hasPermission } = useSeoScopes();
  const allowed = !!user && !loading && hasPermission(SEO_ACTIONS.EXCHANGE_AUTH_CODE);
  const access = useRef(allowed);
  const generation = useRef(0);
  if (access.current !== allowed) generation.current += 1;
  access.current = allowed;
  const mounted = useRef(false);
  const started = useRef(false);
  const [status, setStatus] = useState<"processing" | "success" | "error" | "cancelled">("processing");
  const [detail, setDetail] = useState("");
  const [hasOpener, setHasOpener] = useState(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!allowed) {
      setStatus("error");
      setDetail("Доступ изменился. Повторите авторизацию из раздела SEO.");
    }
  }, [allowed]);

  useEffect(() => {
    if (loading || started.current) return;
    started.current = true;
    setHasOpener(!!window.opener);
    const finish = (outcome: "success" | "error" | "cancelled", message: string, login?: string) => {
      setStatus(outcome);
      setDetail(message);
      if (!window.opener) return;
      // Notification is a refresh hint, never backend authorization.
      try {
        window.opener.postMessage({ type: "eqsite:yandex-oauth", status: outcome, ...(login ? { login } : {}) }, window.location.origin);
        if (outcome === SUCCESS) window.close();
      } catch {
        // A detached opener must not turn a completed exchange into an error.
      }
    };
    // The open callback route does not grant session or mutation permission.
    if (!allowed) {
      finish("error", user ? "Недостаточно прав. Требуется роль SEO." : "Требуется вход в CMS с ролью SEO.");
      return;
    }
    const version = generation.current;
    const isCurrent = () => mounted.current && access.current && version === generation.current;
    const exchange = async () => {
      setStatus("processing");
      setDetail("");
      if (params.has("error")) {
        finish("cancelled", "Авторизация отменена. Вернитесь в визард и повторите попытку.");
        return;
      }
      const code = params.get("code");
      const state = params.get("state");
      if (!code?.trim() || !state?.trim()) {
        finish("error", "Некорректная ссылка авторизации. Начните подключение из раздела SEO.");
        return;
      }
      try {
        const result = await submitYandexAuthCode({ code, state });
        if (!isCurrent()) return;
        if (isApiError(result)) {
          finish("error", "Не удалось добавить аккаунт. Проверьте сессию CMS и права SEO, затем повторите авторизацию.");
        } else {
          const login = result.data?.yandex_login;
          finish("success", login ? `Аккаунт Яндекса ${login} успешно добавлен.` : "Аккаунт Яндекса успешно добавлен.", login);
        }
      } catch {
        if (!isCurrent()) return;
        // Backend detail/exception may contain the one-time code: never render it.
        finish("error", "Не удалось добавить аккаунт. Повторите авторизацию из раздела SEO.");
      }
    };
    void exchange();
  }, [params, loading, allowed, user]);

  // Never expose a completed login or account detail after access has changed.
  if (!loading && !allowed) {
    return { status: "error" as const, detail: user ? "Недостаточно прав. Требуется роль SEO." : "Требуется вход в CMS с ролью SEO.", hasOpener };
  }
  if (loading) return { status: "processing" as const, detail: "", hasOpener };
  return { status, detail, hasOpener };
}
