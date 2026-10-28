"use client";

import { useEffect, useRef, useState } from "react";
import type { SeoBlacklistItemOutDto, SeoNormalizationKind } from "@/types/api/seo";
import { isApiError } from "@/lib/apiStatus";
import { fetchSeoNormalization, removeSeoNormalization, submitSeoNormalization } from "../services/seoDataService";
import { normalizationSchemas } from "../validators/normalization";
import { SEO_ACTIONS, useSeoScopes } from "./useSeoScopes";

const HASHES = "hashes";
const SIZE = 10;
const DELETE_ERROR = "Не удалось удалить элемент. Возможно, он уже отсутствует";
const lastOffset = (length: number) => Math.max(0, Math.ceil(length / SIZE) - 1) * SIZE;

export function usePageNormalization() {
  const { hasPermission } = useSeoScopes();
  const allowed = hasPermission(SEO_ACTIONS.LIST_NORMALIZATION);
  const permissions = useRef(hasPermission);
  permissions.current = hasPermission;
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<SeoNormalizationKind>(HASHES);
  const [collections, setCollections] = useState<Record<SeoNormalizationKind, SeoBlacklistItemOutDto[]>>({ hashes: [], params: [] });
  const [input, setInput] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selected, setSelected] = useState<(SeoBlacklistItemOutDto & { kind: SeoNormalizationKind }) | null>(null);
  const generation = useRef(0);
  const lock = useRef(false);
  const visible = useRef(false);
  const current = (version: number) => version === generation.current && visible.current && permissions.current(SEO_ACTIONS.LIST_NORMALIZATION);

  const load = async (target: SeoNormalizationKind, version: number, refresh = false) => {
    if (!current(version)) return;
    setLoading(true);
    setReadError(null);
    try {
      const result = await fetchSeoNormalization(target);
      if (!current(version)) return;
      if (isApiError(result)) throw new Error(result.data.detail);
      const items = result.data?.items ?? [];
      setCollections(previous => ({ ...previous, [target]: items }));
      setOffset(previous => Math.min(previous, lastOffset(items.length)));
    } catch {
      if (current(version)) setReadError(refresh ? "Изменение сохранено, но не удалось обновить список" : "Не удалось загрузить список");
    } finally {
      if (current(version)) setLoading(false);
    }
  };
  const reset = () => {
    setInput(""); setOffset(0); setError(null); setReadError(null); setDeleteError(null); setSelected(null);
  };
  const show = () => {
    if (lock.current || !permissions.current(SEO_ACTIONS.LIST_NORMALIZATION)) return;
    visible.current = true;
    const version = ++generation.current;
    reset(); setKind(HASHES); setCollections({ hashes: [], params: [] }); setOpen(true);
    void load(HASHES, version);
  };
  const close = () => {
    if (lock.current) return;
    visible.current = false; generation.current += 1; setOpen(false); reset();
  };
  const switchKind = (value: string) => {
    if (lock.current || !visible.current || !permissions.current(SEO_ACTIONS.LIST_NORMALIZATION)) return;
    const target = value === HASHES ? HASHES : "params";
    const version = ++generation.current;
    reset(); setKind(target);
    void load(target, version);
  };
  useEffect(() => {
    if (!allowed) {
      visible.current = false; generation.current += 1;
      setOpen(false); setCollections({ hashes: [], params: [] }); reset(); setLoading(false);
    }
    return () => { generation.current += 1; };
  }, [allowed]);

  const create = async () => {
    if (lock.current || !visible.current || selected || !permissions.current(SEO_ACTIONS.CREATE_NORMALIZATION)) return;
    const parsed = normalizationSchemas[kind].safeParse(input);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    lock.current = true; setPending(true); setError(null);
    const version = ++generation.current;
    setLoading(false);
    try {
      const result = await submitSeoNormalization(kind, { value: parsed.data });
      if (!current(version)) return;
      if (isApiError(result)) { setError(result.data.detail); return; }
      const canonical = result.data;
      if (canonical) setCollections(previous => ({ ...previous, [kind]: [canonical, ...previous[kind].filter(item => item.id !== canonical.id)] }));
      setInput(""); setOffset(0);
      await load(kind, version, true);
    } catch {
      if (current(version)) setError("Не удалось добавить элемент");
    } finally { lock.current = false; setPending(false); }
  };
  const select = (item: SeoBlacklistItemOutDto) => {
    if (lock.current || !visible.current || !permissions.current(SEO_ACTIONS.DELETE_NORMALIZATION)) return;
    setSelected({ ...item, kind }); setDeleteError(null);
  };
  const cancelDelete = () => {
    if (!lock.current) { setSelected(null); setDeleteError(null); }
  };
  const selectedMissing = !!selected && !collections[selected.kind].some(item => item.id === selected.id);
  const confirmDelete = async () => {
    if (lock.current || !visible.current || !selected || selectedMissing || !permissions.current(SEO_ACTIONS.DELETE_NORMALIZATION)) return;
    lock.current = true; setPending(true); setDeleteError(null);
    const version = ++generation.current;
    setLoading(false);
    try {
      const result = await removeSeoNormalization(selected.kind, selected.id);
      if (!current(version)) return;
      if (isApiError(result)) {
        setDeleteError(DELETE_ERROR);
        await load(selected.kind, version);
        return;
      }
      const remaining = collections[selected.kind].filter(item => item.id !== selected.id);
      setCollections(previous => ({ ...previous, [selected.kind]: remaining }));
      setOffset(previous => Math.min(previous, lastOffset(remaining.length)));
      setSelected(null);
      await load(selected.kind, version, true);
    } catch {
      if (current(version)) { setDeleteError(DELETE_ERROR); await load(selected.kind, version); }
    } finally { lock.current = false; setPending(false); }
  };
  const changeInput = (value: string) => {
    if (!lock.current && !selected && permissions.current(SEO_ACTIONS.LIST_NORMALIZATION)) { setInput(value); setError(null); }
  };
  const changePage = (page: number) => {
    if (!lock.current && !selected && permissions.current(SEO_ACTIONS.LIST_NORMALIZATION)) setOffset(Math.min((page - 1) * SIZE, lastOffset(collections[kind].length)));
  };
  const retry = () => {
    if (!lock.current && permissions.current(SEO_ACTIONS.LIST_NORMALIZATION)) void load(kind, ++generation.current);
  };
  return {
    open: open && allowed, kind, input, offset, loading, pending, error, readError, deleteError, selected, selectedMissing,
    items: allowed ? collections[kind].slice(offset, offset + SIZE) : [], total: allowed ? collections[kind].length : 0,
    canCreate: hasPermission(SEO_ACTIONS.CREATE_NORMALIZATION), canDelete: hasPermission(SEO_ACTIONS.DELETE_NORMALIZATION),
    show, close, switchKind, create, select, cancelDelete, confirmDelete, changeInput, changePage, retry,
  };
}
