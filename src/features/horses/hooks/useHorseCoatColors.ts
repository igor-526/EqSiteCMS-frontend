import { SetStateAction, useEffect, useState, useCallback } from "react";
import { API_STATUS, isApiError, isApiSuccess } from "@/lib/apiStatus";
import { useNotification } from "@/hooks/useNotification";
import { zodErrorNormalize } from "@/lib/zodErrorNormalize";
import { UUID } from "crypto";
import { HorseCoatColorListQueryParams, HorseCoatColorOutDto, HorseCoatColorCreateInDto, HorseCoatColorUpdateInDto } from "@/types/api/horseCoatColor";
import { fetchCreateHorseCoatColor, fetchDeleteHorseCoatColor, fetchHorseCoatColorList, fetchUpdateHorseCoatColor } from "../services/horseCoatColorService";
import { horseCoatColorCreateSchema, horseCoatColorUpdateSchema } from "../validators/horseCoatColors";

const defaultHorseCoatColorsFilters: HorseCoatColorListQueryParams = {
    name: undefined,
    short_name: undefined,
    slug: undefined,
    description: undefined,
    page_data: undefined,
    sort: [],
    limit: 25,
    offset: 0,
};

const normalizeHorseCoatColorsFilters = (
    next: HorseCoatColorListQueryParams,
    prev: HorseCoatColorListQueryParams,
): HorseCoatColorListQueryParams => {
    const normalizedNext = {
        ...next,
        sort: Array.isArray(next.sort) && next.sort.length > 0 ? next.sort : [],
    };
    const shouldResetOffset = normalizedNext.limit !== prev.limit ||
        normalizedNext.name !== prev.name ||
        normalizedNext.short_name !== prev.short_name ||
        normalizedNext.slug !== prev.slug ||
        normalizedNext.description !== prev.description ||
        normalizedNext.page_data !== prev.page_data ||
        JSON.stringify(normalizedNext.sort) !== JSON.stringify(prev.sort ?? []);
    return { ...normalizedNext, offset: shouldResetOffset ? 0 : normalizedNext.offset };
};

export const useHorseCoatColors = () => {
    const toast = useNotification();
    const [horseCoatColors, setHorseCoatColors] = useState<HorseCoatColorOutDto[]>([]);
    const [horseCoatColorsFilters, setHorseCoatColorsFiltersState] = useState<HorseCoatColorListQueryParams>(defaultHorseCoatColorsFilters);
    const [horseCoatColorsTotal, setHorseCoatColorsTotal] = useState<number>(0);
    const [horseCoatColorsLoading, setHorseCoatColorsLoading] = useState<boolean>(false);
    const [horseCoatColorsValidationErrors, setHorseCoatColorsValidationErrors] = useState<Record<string, string[]>>({});


    const loadHorseCoatColors = useCallback(async () => {
        setHorseCoatColorsLoading(true);
        const response = await fetchHorseCoatColorList(horseCoatColorsFilters);

        switch (response.status) {
            case API_STATUS.OK:
                setHorseCoatColors(response?.data?.items || []);
                setHorseCoatColorsTotal(response?.data?.total || 0);
                break;
            case API_STATUS.ERROR:
                toast.error({
                    title: "Ошибка",
                    description: "Не удалось загрузить масти лошадей",
                });
                break;
            default:
                toast.error({
                    title: "Ошибка",
                    description: "Неизвестная ошибка",
                });
                break;
        }
        setHorseCoatColorsLoading(false);
    }, [toast, horseCoatColorsFilters]);


    useEffect(() => {
        loadHorseCoatColors();
    }, [horseCoatColorsFilters, loadHorseCoatColors]);

    const setHorseCoatColorsFilters = useCallback((value: SetStateAction<HorseCoatColorListQueryParams>) => {
        setHorseCoatColorsFiltersState((prev) => {
            const resolved = typeof value === "function" ? value(prev) : value;
            return normalizeHorseCoatColorsFilters(resolved, prev);
        });
    }, []);

    const createHorseCoatColor = useCallback(async (createData: HorseCoatColorCreateInDto) => {
        const validatedData = horseCoatColorCreateSchema.safeParse(createData);
        if (!validatedData.success) {
            setHorseCoatColorsValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchCreateHorseCoatColor(createData);
        switch (response.status) {
            case API_STATUS.OK:
                toast.success({
                    title: "Успешно",
                    description: "Масть лошади успешно создана",
                });
                loadHorseCoatColors()
                return true;
            case API_STATUS.ERROR:
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
    }, [toast, loadHorseCoatColors]);

    const updateHorseCoatColor = useCallback(async (horseCoatColorId: UUID, updateData: HorseCoatColorUpdateInDto) => {
        const validatedData = horseCoatColorUpdateSchema.safeParse(updateData);
        if (!validatedData.success) {
            setHorseCoatColorsValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchUpdateHorseCoatColor(horseCoatColorId, updateData);
        switch (response.status) {
            case API_STATUS.OK:
                toast.success({
                    title: "Успешно",
                    description: "Масть лошади успешно обновлена",
                });
                loadHorseCoatColors()
                return true;
            case API_STATUS.ERROR:
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
    }, [toast, loadHorseCoatColors]);

    const deleteHorseCoatColor = useCallback(async (horseCoatColorId: UUID) => {
        const response = await fetchDeleteHorseCoatColor(horseCoatColorId);
        switch (response.status) {
            case API_STATUS.OK:
                toast.success({
                    title: "Успешно",
                    description: "Масть лошади успешно удалена",
                });
                loadHorseCoatColors()
                return true;
            case API_STATUS.ERROR:
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
    }, [toast, loadHorseCoatColors]);


    const resetHorseCoatColorsValidation = useCallback(() => {
        setHorseCoatColorsValidationErrors({});
    }, []);

    const resetHorseCoatColorsFilters = useCallback(() => {
        setHorseCoatColorsFiltersState(defaultHorseCoatColorsFilters);
    }, []);

    return {
        horseCoatColors,
        horseCoatColorsTotal,
        horseCoatColorsLoading,
        horseCoatColorsFilters,
        setHorseCoatColorsFilters,
        horseCoatColorsValidationErrors,
        resetHorseCoatColorsValidation,
        resetHorseCoatColorsFilters,
        createHorseCoatColor,
        updateHorseCoatColor,
        deleteHorseCoatColor,
    };
};
