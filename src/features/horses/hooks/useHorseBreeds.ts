import { useEffect, useState, useCallback } from "react";
import { useNotification } from "@/hooks/useNotification";
import { zodErrorNormalize } from "@/lib/zodErrorNormalize";
import { UUID } from "crypto";
import { HorseBreedListQueryParams, HorseBreedOutDto, HorseBreedCreateInDto, HorseBreedUpdateInDto } from "@/types/api/horseBreeds";
import { fetchCreateHorseBreed, fetchDeleteHorseBreed, fetchHorseBreedList, fetchUpdateHorseBreed } from "../services/horseBreedsService";
import { horseBreedCreateSchema, horseBreedUpdateSchema } from "../validators/horseBreeds";

const defaultHorseBreedsFilters: HorseBreedListQueryParams = {
    name: undefined,
    slug: undefined,
    description: undefined,
    page_data: undefined,
    sort: [],
    limit: 25,
    offset: 0,
};

export const useHorseBreeds = () => {
    const toast = useNotification();
    const [horseBreeds, setHorseBreeds] = useState<HorseBreedOutDto[]>([]);
    const [horseBreedsFilters, setHorseBreedsFilters] = useState<HorseBreedListQueryParams>(defaultHorseBreedsFilters);
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
        setHorseBreedsFilters(defaultHorseBreedsFilters);
    }, []);

    return {
        horseBreeds,
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
    };
};
