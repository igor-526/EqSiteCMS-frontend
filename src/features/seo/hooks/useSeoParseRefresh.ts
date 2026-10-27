"use client";

import { useEffect, useRef, useState } from "react";
import { message } from "antd";
import { isApiError } from "@/lib/apiStatus";
import { SEO_PARSE_ERROR, startSeoParseJob } from "../services/seoDataService";
import { SEO_ACTIONS, useSeoScopes } from "./useSeoScopes";

export function useSeoParseRefresh() {
  const { hasPermission } = useSeoScopes();
  const canStart = hasPermission(SEO_ACTIONS.START_PARSE);
  const permissions = useRef(hasPermission);
  permissions.current = hasPermission;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const visible = useRef(false);
  const mounted = useRef(false);
  const generation = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; generation.current += 1; };
  }, []);

  useEffect(() => {
    if (!canStart) {
      generation.current += 1;
      visible.current = false;
      setOpen(false);
      setError(null);
    }
  }, [canStart]);

  const show = () => {
    if (lock.current || !permissions.current(SEO_ACTIONS.START_PARSE)) return;
    visible.current = true;
    setError(null);
    setOpen(true);
  };
  const close = () => {
    if (lock.current) return;
    visible.current = false;
    generation.current += 1;
    setOpen(false);
    setError(null);
  };
  const current = (version: number) => mounted.current && visible.current
    && version === generation.current && permissions.current(SEO_ACTIONS.START_PARSE);
  const confirm = async () => {
    if (lock.current || !visible.current || !permissions.current(SEO_ACTIONS.START_PARSE)) return;
    lock.current = true;
    setPending(true);
    setError(null);
    const version = generation.current;
    try {
      const result = await startSeoParseJob();
      if (!current(version)) return;
      if (isApiError(result)) { setError(result.data.detail); return; }
      visible.current = false;
      setOpen(false);
      void message.success("Обновление поставлено в очередь");
    } catch {
      if (current(version)) setError(SEO_PARSE_ERROR);
    } finally {
      lock.current = false;
      if (mounted.current) setPending(false);
    }
  };

  return { open: open && canStart, pending, error, canStart, show, close, confirm };
}
