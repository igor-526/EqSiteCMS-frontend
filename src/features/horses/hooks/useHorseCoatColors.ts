import { useEffect, useState, useCallback } from "react";
import { useNotification } from "@/hooks/useNotification";
import { zodErrorNormalize } from "@/lib/zodErrorNormalize";
import { UUID } from "crypto";
import { HorseCoatColorListQueryParams, HorseCoatColorOutDto, HorseCoatColorCreateInDto, HorseCoatColorUpdateInDto } from "@/types/api/horseCoatColor";
import { fetchCreateHorseCoatColor, fetchDeleteHorseCoatColor, fetchHorseCoatColorList, fetchUpdateHorseCoatColor } from "../services/horseCoatColorService";
import { horseCoatColorCreateSchema, horseCoatColorUpdateSchema } from "../validators/horseCoatColors";

const defaultHorseCoatColorsFilters: HorseCoatColorListQueryParams = {
    name: undefined,
    slug: undefined,
    description: undefined,
    page_data: undefined,
    sort: [],
    limit: 25,
    offset: 0,
};

export const useHorseCoatColors = () => {
    const toast = useNotification();
    const [horseCoatColors, setHorseCoatColors] = useState<HorseCoatColorOutDto[]>([]);
    const [horseCoatColorsFilters, setHorseCoatColorsFilters] = useState<HorseCoatColorListQueryParams>(defaultHorseCoatColorsFilters);
    const [horseCoatColorsTotal, setHorseCoatColorsTotal] = useState<number>(0);
    const [horseCoatColorsLoading, setHorseCoatColorsLoading] = useState<boolean>(false);
    const [horseCoatColorsValidationErrors, setHorseCoatColorsValidationErrors] = useState<Record<string, string[]>>({});


    const loadHorseCoatColors = useCallback(async () => {
        setHorseCoatColorsLoading(true);
        const response = await fetchHorseCoatColorList(horseCoatColorsFilters);
        console.log(response.data);

        switch (response.status) {
            case "ok":
                setHorseCoatColors(response?.data?.items || []);
                setHorseCoatColorsTotal(response?.data?.total || 0);
                break;
            case "error":
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

    const createHorseCoatColor = useCallback(async (createData: HorseCoatColorCreateInDto) => {
        const validatedData = horseCoatColorCreateSchema.safeParse(createData);
        if (!validatedData.success) {
            setHorseCoatColorsValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchCreateHorseCoatColor(createData);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Масть лошади успешно создана",
                });
                loadHorseCoatColors()
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
    }, [toast, loadHorseCoatColors]);

    const updateHorseCoatColor = useCallback(async (horseCoatColorId: UUID, updateData: HorseCoatColorUpdateInDto) => {
        const validatedData = horseCoatColorUpdateSchema.safeParse(updateData);
        if (!validatedData.success) {
            setHorseCoatColorsValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchUpdateHorseCoatColor(horseCoatColorId, updateData);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Масть лошади успешно обновлена",
                });
                loadHorseCoatColors()
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
    }, [toast, loadHorseCoatColors]);

    const deleteHorseCoatColor = useCallback(async (horseCoatColorId: UUID) => {
        const response = await fetchDeleteHorseCoatColor(horseCoatColorId);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Масть лошади успешно удалена",
                });
                loadHorseCoatColors()
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
    }, [toast, loadHorseCoatColors]);


    const resetHorseCoatColorsValidation = useCallback(() => {
        setHorseCoatColorsValidationErrors({});
    }, []);

    const resetHorseCoatColorsFilters = useCallback(() => {
        setHorseCoatColorsFilters(defaultHorseCoatColorsFilters);
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
