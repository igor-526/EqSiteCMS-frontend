import { useCallback, useEffect, useState, type SetStateAction } from "react";
import { API_STATUS } from "@/lib/apiStatus";
import { useNotification } from "@/hooks/useNotification";
import { zodErrorNormalize } from "@/lib/zodErrorNormalize";
import type {
  HorseBreedGroupCreateInDto,
  HorseBreedGroupListQueryParams,
  HorseBreedGroupOutDto,
  HorseBreedGroupUpdateInDto,
} from "@/types/api/horseBreedGroups";
import {
  fetchCreateHorseBreedGroup,
  fetchDeleteHorseBreedGroup,
  fetchHorseBreedGroupList,
  fetchUpdateHorseBreedGroup,
} from "../services/horseBreedGroupsService";
import { horseBreedGroupCreateSchema, horseBreedGroupUpdateSchema } from "../validators/horseBreedGroups";

export const defaultHorseBreedGroupsFilters: HorseBreedGroupListQueryParams = {
  limit: 25, offset: 0, sort: ["-created_at"],
};

export const normalizeHorseBreedGroupsFilters = (
  next: HorseBreedGroupListQueryParams,
  prev: HorseBreedGroupListQueryParams,
) => {
  const normalized = {
    ...next,
    name: next.name?.trim() || undefined,
    slug: next.slug?.trim() || undefined,
    sort: next.sort?.length ? next.sort : [],
  };
  const reset = normalized.limit !== prev.limit || normalized.name !== prev.name ||
    normalized.slug !== prev.slug || JSON.stringify(normalized.sort) !== JSON.stringify(prev.sort ?? []);
  return { ...normalized, offset: reset ? 0 : normalized.offset };
};

export const useHorseBreedGroups = () => {
  const toast = useNotification();
  const [horseBreedGroups, setHorseBreedGroups] = useState<HorseBreedGroupOutDto[]>([]);
  const [horseBreedGroupsTotal, setHorseBreedGroupsTotal] = useState(0);
  const [horseBreedGroupsLoading, setHorseBreedGroupsLoading] = useState(false);
  const [horseBreedGroupsError, setHorseBreedGroupsError] = useState<string | null>(null);
  const [horseBreedGroupsFilters, setFiltersState] = useState(defaultHorseBreedGroupsFilters);
  const [horseBreedGroupSelectorOptions, setSelectorOptions] = useState<HorseBreedGroupOutDto[]>([]);
  const [horseBreedGroupSelectorLoading, setSelectorLoading] = useState(false);
  const [horseBreedGroupsValidationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const loadHorseBreedGroups = useCallback(async () => {
    setHorseBreedGroupsLoading(true); setHorseBreedGroupsError(null);
    try {
      const response = await fetchHorseBreedGroupList(horseBreedGroupsFilters);
      if (response.status === API_STATUS.OK) {
        setHorseBreedGroups(response.data?.items ?? []); setHorseBreedGroupsTotal(response.data?.total ?? 0);
      } else {
        const message = response.data?.detail || "Не удалось загрузить группы пород";
        setHorseBreedGroupsError(message); toast.error({ title: "Ошибка", description: message });
      }
    } catch {
      setHorseBreedGroupsError("Не удалось загрузить группы пород");
      toast.error({ title: "Ошибка", description: "Не удалось загрузить группы пород" });
    } finally { setHorseBreedGroupsLoading(false); }
  }, [horseBreedGroupsFilters, toast]);

  useEffect(() => { void loadHorseBreedGroups(); }, [loadHorseBreedGroups]);

  const setHorseBreedGroupsFilters = useCallback((value: SetStateAction<HorseBreedGroupListQueryParams>) => {
    setFiltersState((prev) => normalizeHorseBreedGroupsFilters(typeof value === "function" ? value(prev) : value, prev));
  }, []);

  const resetHorseBreedGroupsFilters = useCallback(() => {
    setFiltersState(defaultHorseBreedGroupsFilters);
  }, []);

  const resetHorseBreedGroupsValidation = useCallback(() => {
    setValidationErrors({});
  }, []);

  const loadHorseBreedGroupSelectorOptions = useCallback(async (name?: string) => {
    setSelectorLoading(true);
    try {
      const response = await fetchHorseBreedGroupList({ limit: 100, offset: 0, sort: ["name"], name: name?.trim() || undefined });
      setSelectorOptions(response.status === API_STATUS.OK ? response.data?.items ?? [] : []);
      if (response.status !== API_STATUS.OK) toast.error({ title: "Ошибка", description: response.data?.detail || "Не удалось загрузить группы для выбора" });
    } finally { setSelectorLoading(false); }
  }, [toast]);

  const mutate = useCallback(async (
    schema: typeof horseBreedGroupCreateSchema | typeof horseBreedGroupUpdateSchema,
    data: HorseBreedGroupCreateInDto | HorseBreedGroupUpdateInDto,
    request: () => ReturnType<typeof fetchCreateHorseBreedGroup>,
    success: string,
  ) => {
    const parsed = schema.safeParse(data);
    if (!parsed.success) { setValidationErrors(zodErrorNormalize(parsed.error)); return false; }
    const response = await request();
    if (response.status !== API_STATUS.OK) { toast.error({ title: "Ошибка", description: response.data?.detail || "Неизвестная ошибка" }); return false; }
    toast.success({ title: "Успешно", description: success });
    await loadHorseBreedGroups(); return true;
  }, [loadHorseBreedGroups, toast]);

  const createHorseBreedGroup = useCallback((data: HorseBreedGroupCreateInDto) =>
    mutate(horseBreedGroupCreateSchema, data, () => fetchCreateHorseBreedGroup(data), "Группа пород создана"), [mutate]);
  const updateHorseBreedGroup = useCallback((id: string, data: HorseBreedGroupUpdateInDto) =>
    mutate(horseBreedGroupUpdateSchema, data, () => fetchUpdateHorseBreedGroup(id, data), "Группа пород обновлена"), [mutate]);
  const deleteHorseBreedGroup = useCallback(async (id: string) => {
    const response = await fetchDeleteHorseBreedGroup(id);
    if (response.status !== API_STATUS.OK) { toast.error({ title: "Ошибка", description: response.data?.detail || "Не удалось удалить группу" }); return false; }
    toast.success({ title: "Успешно", description: "Группа пород удалена" }); await loadHorseBreedGroups(); return true;
  }, [loadHorseBreedGroups, toast]);

  return {
    horseBreedGroups, horseBreedGroupsTotal, horseBreedGroupsLoading, horseBreedGroupsError,
    horseBreedGroupsFilters, setHorseBreedGroupsFilters, resetHorseBreedGroupsFilters,
    horseBreedGroupSelectorOptions, horseBreedGroupSelectorLoading, loadHorseBreedGroupSelectorOptions,
    horseBreedGroupsValidationErrors, resetHorseBreedGroupsValidation,
    loadHorseBreedGroups, createHorseBreedGroup, updateHorseBreedGroup, deleteHorseBreedGroup,
  };
};
