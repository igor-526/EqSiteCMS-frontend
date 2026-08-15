import { useState, useEffect, useCallback } from "react";
import { useNotification } from "@/hooks/useNotification";

type FetchResult =
  | { status: "ok"; data: { page_data?: string | null } | null }
  | { status: "error"; data: { detail: string } };
type SaveResult =
  | { status: "ok"; data: unknown }
  | { status: "error"; data: { detail: string } };

interface UsePageEditorOptions {
  entityId: string | null;
  open: boolean;
  fetchPageData: (id: string) => Promise<FetchResult>;
  savePageData: (id: string, pageData: string) => Promise<SaveResult>;
  onSuccess?: () => void;
}

interface UsePageEditorResult {
  initialHtml: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
  save: (html: string) => Promise<void>;
}

export const usePageEditor = ({
  entityId,
  open,
  fetchPageData,
  savePageData,
  onSuccess,
}: UsePageEditorOptions): UsePageEditorResult => {
  const toast = useNotification();
  const [initialHtml, setInitialHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !entityId) {
      setInitialHtml("");
      setError(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPageData(entityId);
        if (result.status === "error") {
          const message = result.data.detail;
          setError(message);
          toast.error({ title: "Ошибка загрузки", description: message });
        } else {
          setInitialHtml(result.data?.page_data ?? "");
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Неизвестная ошибка";
        setError(message);
        toast.error({ title: "Ошибка загрузки", description: message });
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entityId]);

  const save = useCallback(
    async (html: string) => {
      if (!entityId) return;
      setSaving(true);
      setError(null);
      try {
        const result = await savePageData(entityId, html);
        if (result.status === "error") {
          const message = result.data.detail;
          setError(message);
          toast.error({ title: "Ошибка сохранения", description: message });
        } else {
          toast.success({ title: "Сохранено" });
          onSuccess?.();
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Неизвестная ошибка";
        setError(message);
        toast.error({ title: "Ошибка сохранения", description: message });
      } finally {
        setSaving(false);
      }
    },
    [entityId, savePageData, onSuccess, toast],
  );

  return { initialHtml, loading, saving, error, save };
};
