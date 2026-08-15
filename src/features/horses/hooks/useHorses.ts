import { useCallback, useEffect, useState } from "react";
import { API_STATUS, isApiError, isApiSuccess } from "@/lib/apiStatus";
import { useNotification } from "@/hooks/useNotification";
import { zodErrorNormalize } from "@/lib/zodErrorNormalize";
import { UUID } from "crypto";
import {
  HorseCreateInDto,
  HorseGetQueryParams,
  HorseListQueryParams,
  HorseOutDto,
  HorseUpdateInDto,
  HorseWithPedigreeOutDto,
} from "@/types/api/horses";
import {
  fetchCreateHorse,
  fetchDeleteHorse,
  fetchHorse,
  fetchHorseList,
  fetchUpdateHorse,
  fetchUpdateHorsePhotos,
} from "../services/horseService";
import { PhotoUpdateEntityInDto } from "@/types/api/photos";
import { horseCreateSchema, horseUpdateSchema } from "../validators/horses";

const DEFAULT_LIMIT = 25;

const defaultHorsesFilters: HorseListQueryParams = {
  limit: DEFAULT_LIMIT,
  offset: 0,
  sort: [],
  name: undefined,
  description: undefined,
  breed_ids: undefined,
  coat_color_ids: undefined,
  kind: undefined,
  sex: undefined,
  height_gte: undefined,
  height_lte: undefined,
  bdate_gte: undefined,
  bdate_lte: undefined,
  horse_owner_ids: undefined,
  services: undefined,
  this_stable: true,
  pedigree: 1,
};

const hasActiveBreedFilter = (
  filters: Pick<HorseListQueryParams, "breed_ids">,
) => Array.isArray(filters.breed_ids) && filters.breed_ids.length > 0;

const normalizeHorsesFilters = (
  filters: HorseListQueryParams,
): HorseListQueryParams => {
  const normalizedBreedIds = hasActiveBreedFilter(filters)
    ? filters.breed_ids
    : undefined;

  return {
    ...filters,
    breed_ids: normalizedBreedIds,
    kind: normalizedBreedIds ? undefined : filters.kind,
  };
};

export const useHorses = () => {
  const toast = useNotification();

  const [horses, setHorses] = useState<
    (HorseOutDto | HorseWithPedigreeOutDto)[]
  >([]);
  const [horsesTotal, setHorsesTotal] = useState<number>(0);
  const [horsesLoading, setHorsesLoading] = useState<boolean>(false);
  const [horsesError, setHorsesError] = useState<string | null>(null);
  const [horsesFilters, setHorsesFiltersState] =
    useState<HorseListQueryParams>(defaultHorsesFilters);
  const [horsesValidationErrors, setHorsesValidationErrors] = useState<
    Record<string, string[]>
  >({});

  const loadHorses = useCallback(async () => {
    setHorsesLoading(true);
    setHorsesError(null);
    const response = await fetchHorseList(horsesFilters);
    switch (response.status) {
      case API_STATUS.OK:
        setHorses(response.data?.items || []);
        setHorsesTotal(response.data?.total || 0);
        break;
      case API_STATUS.ERROR:
        setHorsesError(response.data?.detail || "Не удалось загрузить лошадей");
        toast.error({
          title: "Ошибка",
          description: response.data?.detail || "Не удалось загрузить лошадей",
        });
        break;
      default:
        setHorsesError("Неизвестная ошибка");
        toast.error({
          title: "Ошибка",
          description: "Неизвестная ошибка",
        });
        break;
    }
    setHorsesLoading(false);
  }, [toast, horsesFilters]);

  useEffect(() => {
    loadHorses();
  }, [horsesFilters, loadHorses]);

  const setHorsesFilters = useCallback(
    (newFilters: Partial<HorseListQueryParams>) => {
      setHorsesFiltersState((prev) =>
        normalizeHorsesFilters({
          ...prev,
          ...newFilters,
          offset: 0,
        }),
      );
    },
    [],
  );

  const setHorsesPage = useCallback((offset: number) => {
    setHorsesFiltersState((prev) => ({ ...prev, offset }));
  }, []);

  const setHorsesLimit = useCallback((limit: number) => {
    setHorsesFiltersState((prev) => ({ ...prev, limit, offset: 0 }));
  }, []);

  const resetHorsesFilters = useCallback(() => {
    setHorsesFiltersState(normalizeHorsesFilters(defaultHorsesFilters));
  }, []);

  const resetHorsesValidation = useCallback(() => {
    setHorsesValidationErrors({});
  }, []);

  const getHorseDetail = useCallback(
    async (
      idOrSlug: string,
      params: HorseGetQueryParams = {},
    ): Promise<HorseOutDto | HorseWithPedigreeOutDto | null> => {
      const response = await fetchHorse(idOrSlug, params);
      switch (response.status) {
        case API_STATUS.OK:
          return response.data ?? null;
        case API_STATUS.ERROR:
          toast.error({
            title: "Ошибка",
            description:
              response.data?.detail || "Не удалось загрузить карточку лошади",
          });
          return null;
        default:
          toast.error({ title: "Ошибка", description: "Неизвестная ошибка" });
          return null;
      }
    },
    [toast],
  );

  const createHorse = useCallback(
    async (createData: HorseCreateInDto): Promise<boolean> => {
      const validated = horseCreateSchema.safeParse(createData);
      if (!validated.success) {
        setHorsesValidationErrors(zodErrorNormalize(validated.error));
        return false;
      }
      const response = await fetchCreateHorse(createData);
      switch (response.status) {
        case API_STATUS.OK:
          toast.success({
            title: "Успешно",
            description: "Лошадь успешно добавлена",
          });
          loadHorses();
          return true;
        case API_STATUS.ERROR:
          toast.error({
            title: "Ошибка",
            description: response.data?.detail || "Неизвестная ошибка",
          });
          return false;
        default:
          toast.error({ title: "Ошибка", description: "Неизвестная ошибка" });
          return false;
      }
    },
    [toast, loadHorses],
  );

  const updateHorse = useCallback(
    async (horseId: UUID, updateData: HorseUpdateInDto): Promise<boolean> => {
      const validated = horseUpdateSchema.safeParse(updateData);
      if (!validated.success) {
        setHorsesValidationErrors(zodErrorNormalize(validated.error));
        return false;
      }
      const response = await fetchUpdateHorse(horseId, updateData);
      switch (response.status) {
        case API_STATUS.OK:
          toast.success({
            title: "Успешно",
            description: "Лошадь успешно обновлена",
          });
          loadHorses();
          return true;
        case API_STATUS.ERROR:
          toast.error({
            title: "Ошибка",
            description: response.data?.detail || "Неизвестная ошибка",
          });
          return false;
        default:
          toast.error({ title: "Ошибка", description: "Неизвестная ошибка" });
          return false;
      }
    },
    [toast, loadHorses],
  );

  const deleteHorse = useCallback(
    async (horseId: UUID): Promise<boolean> => {
      const response = await fetchDeleteHorse(horseId);
      switch (response.status) {
        case API_STATUS.OK:
          toast.success({
            title: "Успешно",
            description: "Лошадь успешно удалена",
          });
          loadHorses();
          return true;
        case API_STATUS.ERROR:
          toast.error({
            title: "Ошибка",
            description: response.data?.detail || "Неизвестная ошибка",
          });
          return false;
        default:
          toast.error({ title: "Ошибка", description: "Неизвестная ошибка" });
          return false;
      }
    },
    [toast, loadHorses],
  );

  const updateHorsePhotos = useCallback(
    async (
      horseId: UUID,
      updateData: PhotoUpdateEntityInDto,
    ): Promise<HorseOutDto | null> => {
      const response = await fetchUpdateHorsePhotos(horseId, updateData);
      switch (response.status) {
        case API_STATUS.OK:
          if (response.data) {
            setHorses((prev) =>
              prev.map((horse) =>
                horse.id === horseId ? { ...horse, ...response.data } : horse,
              ),
            );
          }
          loadHorses();
          return response.data ?? null;
        case API_STATUS.ERROR:
          toast.error({
            title: "Ошибка",
            description:
              response.data?.detail || "Не удалось обновить фотографии",
          });
          return null;
        default:
          toast.error({ title: "Ошибка", description: "Неизвестная ошибка" });
          return null;
      }
    },
    [toast, loadHorses],
  );

  return {
    horses,
    horsesTotal,
    horsesLoading,
    horsesError,
    horsesFilters,
    setHorses,
    setHorsesFilters,
    setHorsesPage,
    setHorsesLimit,
    resetHorsesFilters,
    horsesValidationErrors,
    resetHorsesValidation,
    createHorse,
    updateHorse,
    deleteHorse,
    updateHorsePhotos,
    getHorseDetail,
    loadHorses,
  };
};
