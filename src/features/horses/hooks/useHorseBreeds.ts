import { SetStateAction, useEffect, useState, useCallback } from "react";
import { useNotification } from "@/hooks/useNotification";
import { zodErrorNormalize } from "@/lib/zodErrorNormalize";
import { UUID } from "crypto";
import {
    HorseBreedListQueryParams,
    HorseBreedOutDto,
    HorseBreedCreateInDto,
    HorseBreedUpdateInDto,
    HorseKind,
} from "@/types/api/horseBreeds";
import { fetchCreateHorseBreed, fetchDeleteHorseBreed, fetchHorseBreedList, fetchUpdateHorseBreed } from "../services/horseBreedsService";
import { horseBreedCreateSchema, horseBreedUpdateSchema } from "../validators/horseBreeds";

const defaultHorseBreedsFilters: HorseBreedListQueryParams = {
    name: undefined,
    slug: undefined,
    description: undefined,
    page_data: undefined,
    kind: undefined,
    sort: [],
    limit: 25,
    offset: 0,
};

const normalizeHorseBreedsFilters = (
    next: HorseBreedListQueryParams,
    prev?: HorseBreedListQueryParams,
): HorseBreedListQueryParams => {
    const normalizedNext = {
        ...next,
        kind: Array.isArray(next.kind) && next.kind.length > 0 ? next.kind : undefined,
        sort: Array.isArray(next.sort) && next.sort.length > 0 ? next.sort : [],
    };
    const shouldResetOffset = prev
        ? normalizedNext.limit !== prev.limit ||
          normalizedNext.name !== prev.name ||
          normalizedNext.slug !== prev.slug ||
          normalizedNext.description !== prev.description ||
          normalizedNext.page_data !== prev.page_data ||
          JSON.stringify(normalizedNext.kind ?? []) !== JSON.stringify(prev.kind ?? []) ||
          JSON.stringify(normalizedNext.sort ?? []) !== JSON.stringify(prev.sort ?? [])
        : false;

    return {
        ...normalizedNext,
        offset: shouldResetOffset ? 0 : normalizedNext.offset,
    };
};

export const useHorseBreeds = () => {
    const toast = useNotification();
    const [horseBreeds, setHorseBreeds] = useState<HorseBreedOutDto[]>([]);
    const [horseBreedsFilters, setHorseBreedsFiltersState] = useState<HorseBreedListQueryParams>(defaultHorseBreedsFilters);
    const [horseBreedSelectorOptions, setHorseBreedSelectorOptions] = useState<HorseBreedOutDto[]>([]);
    const [horseBreedSelectorLoading, setHorseBreedSelectorLoading] = useState<boolean>(false);
    const [horseBreedsTotal, setHorseBreedsTotal] = useState<number>(0);
    const [horseBreedsLoading, setHorseBreedsLoading] = useState<boolean>(false);
    const [horseBreedsValidationErrors, setHorseBreedsValidationErrors] = useState<Record<string, string[]>>({});


    const loadHorseBreeds = useCallback(async () => {
        setHorseBreedsLoading(true);
        const response = await fetchHorseBreedList(horseBreedsFilters);

        switch (response.status) {
            case "ok":
                setHorseBreeds(response?.data?.items || []);
                setHorseBreedsTotal(response?.data?.total || 0);
                break;
            case "error":
                toast.error({
                    title: "Ошибка",
                    description: "Не удалось загрузить породы лошадей",
                });
                break;
            default:
                toast.error({
                    title: "Ошибка",
                    description: "Неизвестная ошибка",
                });
                break;
        }
        setHorseBreedsLoading(false);
    }, [toast, horseBreedsFilters]);


    useEffect(() => {
        loadHorseBreeds();
    }, [horseBreedsFilters, loadHorseBreeds]);

    const setHorseBreedsFilters = useCallback((
        value: SetStateAction<HorseBreedListQueryParams>,
    ) => {
        setHorseBreedsFiltersState((prev) => {
            const resolved = typeof value === "function" ? value(prev) : value;
            return normalizeHorseBreedsFilters(resolved, prev);
        });
    }, []);

    const loadHorseBreedSelectorOptions = useCallback(async (kind?: HorseKind[] | null) => {
        setHorseBreedSelectorLoading(true);
        const response = await fetchHorseBreedList({
            limit: 100,
            offset: 0,
            sort: ["name"],
            kind: kind && kind.length > 0 ? kind : undefined,
        });

        switch (response.status) {
            case "ok":
                setHorseBreedSelectorOptions(response.data?.items || []);
                break;
            case "error":
                setHorseBreedSelectorOptions([]);
                toast.error({
                    title: "Ошибка",
                    description: "Не удалось загрузить породы для выбора",
                });
                break;
            default:
                setHorseBreedSelectorOptions([]);
                toast.error({
                    title: "Ошибка",
                    description: "Неизвестная ошибка",
                });
                break;
        }
        setHorseBreedSelectorLoading(false);
    }, [toast]);

    const createHorseBreed = useCallback(async (createData: HorseBreedCreateInDto) => {
        const validatedData = horseBreedCreateSchema.safeParse(createData);
        if (!validatedData.success) {
            setHorseBreedsValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchCreateHorseBreed(createData);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Порода лошади успешно создана",
                });
                loadHorseBreeds()
                return true;
            case "error":
                toast.error({
                    title: "Ошибка",
                    description: response?.data?.detail || "Неизвестная ошибка",
                });
                return false;
            default:
                toast.error({
                    title: "Ошибка",
                    description: "Неизвестная ошибка",
                });
                return false;
        }
    }, [toast, loadHorseBreeds]);

    const updateHorseBreed = useCallback(async (horseBreedId: UUID, updateData: HorseBreedUpdateInDto) => {
        const validatedData = horseBreedUpdateSchema.safeParse(updateData);
        if (!validatedData.success) {
            setHorseBreedsValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchUpdateHorseBreed(horseBreedId, updateData);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Порода лошади успешно обновлена",
                });
                loadHorseBreeds()
                return true;
            case "error":
                toast.error({
                    title: "Ошибка",
                    description: response?.data?.detail || "Неизвестная ошибка",
                });
                return false;
            default:
                toast.error({
                    title: "Ошибка",
                    description: "Неизвестная ошибка",
                });
                return false;
        }
    }, [toast, loadHorseBreeds]);

    const deleteHorseBreed = useCallback(async (horseBreedId: UUID) => {
        const response = await fetchDeleteHorseBreed(horseBreedId);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Порода лошади успешно удалена",
                });
                loadHorseBreeds()
                return true;
            case "error":
                toast.error({
                    title: "Ошибка",
                    description: response?.data?.detail || "Неизвестная ошибка",
                });
                return false;
            default:
                toast.error({
                    title: "Ошибка",
                    description: "Неизвестная ошибка",
                });
                return false;
        }
    }, [toast, loadHorseBreeds]);


    const resetHorseBreedsValidation = useCallback(() => {
        setHorseBreedsValidationErrors({});
    }, []);

    const resetHorseBreedsFilters = useCallback(() => {
        setHorseBreedsFiltersState(defaultHorseBreedsFilters);
    }, []);

    return {
        horseBreeds,
        horseBreedSelectorOptions,
        horseBreedSelectorLoading,
        horseBreedsTotal,
        horseBreedsLoading,
        horseBreedsFilters,
        setHorseBreedsFilters,
        horseBreedsValidationErrors,
        resetHorseBreedsValidation,
        resetHorseBreedsFilters,
        createHorseBreed,
        updateHorseBreed,
        deleteHorseBreed,
        loadHorseBreedSelectorOptions,
    };
};
