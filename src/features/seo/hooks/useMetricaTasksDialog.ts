"use client";

import { useRef, useState, type ComponentRef } from "react";
import type { Button } from "antd";
import type { FiltersSetter } from "@/types/filters/filterBase";
import { useMetricaTasks } from "./useMetricaTasks";
import { useSeoParseRefresh } from "./useSeoParseRefresh";

// The owner keys this session by binding identity and unmounts it on revoke.
export function useMetricaTasksDialog(bindingKey: string) {
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const trigger = useRef<ComponentRef<typeof Button>>(null);
  const refreshTrigger = useRef<ComponentRef<typeof Button>>(null);
  const tasks = useMetricaTasks({ open, bindingKey });
  const onAccepted = () => { setAccepted(true); tasks.reloadFromStart(); };
  const parse = useSeoParseRefresh(onAccepted);
  const show = () => {
    if (!tasks.allowed) return;
    setAccepted(false);
    setOpen(true);
  };
  const close = () => {
    if (parse.open || parse.pending) return;
    setOpen(false);
    trigger.current?.focus();
  };
  const restoreRefreshFocus = () => refreshTrigger.current?.focus();
  const cancelConfirmation = () => {
    parse.close();
    if (!parse.pending) restoreRefreshFocus();
  };
  const setFilters: FiltersSetter<{ limit: number; offset: number }> = update => {
    if (parse.open || parse.pending) return;
    const previous = { limit: tasks.limit, offset: tasks.offset };
    // eslint-disable-next-line no-restricted-syntax -- A literal typeof guard is required for TypeScript narrowing of SetStateAction.
    const next = typeof update === "function" ? update(previous) : update;
    if (next.limit !== previous.limit) tasks.setLimit(next.limit);
    else if (next.offset !== previous.offset) tasks.setOffset(next.offset);
  };
  return {
    open: open && tasks.allowed, show, close, trigger, refreshTrigger,
    tasks, parse, accepted, setFilters, cancelConfirmation, restoreRefreshFocus,
  };
}
