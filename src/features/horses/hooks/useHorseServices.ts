import { useEffect, useState, useCallback } from "react";
import { useNotification } from "@/hooks/useNotification";
import { zodErrorNormalize } from "@/lib/zodErrorNormalize";
import { UUID } from "crypto";
import { HorseServiceListQueryParams, HorseServiceOutDto, HorseServiceCreateInDto, HorseServiceUpdateInDto } from "@/types/api/horseServices";
import { fetchCreateHorseService, fetchDeleteHorseService, fetchHorseServiceList, fetchUpdateHorseService } from "../services/horseServicesService";
import { horseServiceCreateSchema, horseServiceUpdateSchema } from "../validators/horseServices";

const defaultHorseServicesFilters: HorseServiceListQueryParams = {
    name: undefined,
    slug: undefined,
    description: undefined,
    page_data: undefined,
    sort: [],
    limit: 25,
    offset: 0,
};

export const useHorseServices = () => {
    const toast = useNotification();
    const [horseServices, setHorseServices] = useState<HorseServiceOutDto[]>([]);
    const [horseServicesFilters, setHorseServicesFilters] = useState<HorseServiceListQueryParams>(defaultHorseServicesFilters);
    const [horseServicesTotal, setHorseServicesTotal] = useState<number>(0);
    const [horseServicesLoading, setHorseServicesLoading] = useState<boolean>(false);
    const [horseServicesValidationErrors, setHorseServicesValidationErrors] = useState<Record<string, string[]>>({});


    const loadHorseServices = useCallback(async () => {
        setHorseServicesLoading(true);
        const response = await fetchHorseServiceList(horseServicesFilters);
        console.log(response.data);

        switch (response.status) {
            case "ok":
                setHorseServices(response?.data?.items || []);
                setHorseServicesTotal(response?.data?.total || 0);
                break;
            case "error":
                toast.error({
                    title: "Ошибка",
                    description: "Не удалось загрузить услуги для лошадей",
                });
                break;
            default:
                toast.error({
                    title: "Ошибка",
                    description: "Неизвестная ошибка",
                });
                break;
        }
        setHorseServicesLoading(false);
    }, [toast, horseServicesFilters]);


    useEffect(() => {
        loadHorseServices();
    }, [horseServicesFilters, loadHorseServices]);

    const createHorseService = useCallback(async (createData: HorseServiceCreateInDto) => {
        const validatedData = horseServiceCreateSchema.safeParse(createData);
        if (!validatedData.success) {
            setHorseServicesValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchCreateHorseService(createData);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Услуга для лошади успешно создана",
                });
                loadHorseServices()
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
    }, [toast, loadHorseServices]);

    const updateHorseService = useCallback(async (horseServiceId: UUID, updateData: HorseServiceUpdateInDto) => {
        const validatedData = horseServiceUpdateSchema.safeParse(updateData);
        if (!validatedData.success) {
            setHorseServicesValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchUpdateHorseService(horseServiceId, updateData);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Услуга для лошади успешно обновлена",
                });
                loadHorseServices()
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
    }, [toast, loadHorseServices]);

    const deleteHorseService = useCallback(async (horseServiceId: UUID) => {
        const response = await fetchDeleteHorseService(horseServiceId);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Услуга для лошади успешно удалена",
                });
                loadHorseServices()
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
    }, [toast, loadHorseServices]);


    const resetHorseServicesValidation = useCallback(() => {
        setHorseServicesValidationErrors({});
    }, []);

    const resetHorseServicesFilters = useCallback(() => {
        setHorseServicesFilters(defaultHorseServicesFilters);
    }, []);

    return {
        horseServices,
        horseServicesTotal,
        horseServicesLoading,
        horseServicesFilters,
        setHorseServicesFilters,
        horseServicesValidationErrors,
        resetHorseServicesValidation,
        resetHorseServicesFilters,
        createHorseService,
        updateHorseService,
        deleteHorseService,
    };
};
