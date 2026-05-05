import { useEffect, useState, useCallback } from "react";
import { useNotification } from "@/hooks/useNotification";
import { zodErrorNormalize } from "@/lib/zodErrorNormalize";
import { UUID } from "crypto";
import { HorseOwnerListQueryParams, HorseOwnerOutDto, HorseOwnerCreateInDto, HorseOwnerUpdateInDto } from "@/types/api/horseOwners";
import { fetchCreateHorseOwner, fetchDeleteHorseOwner, fetchHorseOwnerList, fetchUpdateHorseOwner } from "../services/horseOwnerService";
import { horseOwnerCreateSchema, horseOwnerUpdateSchema } from "../validators/horseOwners";

const defaultHorseOwnersFilters: HorseOwnerListQueryParams = {
    name: undefined,
    description: undefined,
    type: undefined,
    address: undefined,
    phone_numbers: undefined,
    sort: [],
    limit: 25,
    offset: 0,
};

export const useHorseOwners = () => {
    const toast = useNotification();
    const [horseOwners, setHorseOwners] = useState<HorseOwnerOutDto[]>([]);
    const [horseOwnersFilters, setHorseOwnersFilters] = useState<HorseOwnerListQueryParams>(defaultHorseOwnersFilters);
    const [horseOwnersTotal, setHorseOwnersTotal] = useState<number>(0);
    const [horseOwnersLoading, setHorseOwnersLoading] = useState<boolean>(false);
    const [horseOwnersValidationErrors, setHorseOwnersValidationErrors] = useState<Record<string, string[]>>({});


    const loadHorseOwners = useCallback(async () => {
        setHorseOwnersLoading(true);
        const response = await fetchHorseOwnerList(horseOwnersFilters);
        console.log(response.data);

        switch (response.status) {
            case "ok":
                setHorseOwners(response?.data?.items || []);
                setHorseOwnersTotal(response?.data?.total || 0);
                break;
            case "error":
                toast.error({
                    title: "Ошибка",
                    description: "Не удалось загрузить владельцев лошадей",
                });
                break;
            default:
                toast.error({
                    title: "Ошибка",
                    description: "Неизвестная ошибка",
                });
                break;
        }
        setHorseOwnersLoading(false);
    }, [toast, horseOwnersFilters]);


    useEffect(() => {
        loadHorseOwners();
    }, [horseOwnersFilters, loadHorseOwners]);

    const createHorseOwner = useCallback(async (createData: HorseOwnerCreateInDto) => {
        const validatedData = horseOwnerCreateSchema.safeParse(createData);
        if (!validatedData.success) {
            setHorseOwnersValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchCreateHorseOwner(createData);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Владелец лошади успешно создан",
                });
                loadHorseOwners()
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
    }, [toast, loadHorseOwners]);

    const updateHorseOwner = useCallback(async (horseOwnerId: UUID, updateData: HorseOwnerUpdateInDto) => {
        const validatedData = horseOwnerUpdateSchema.safeParse(updateData);
        if (!validatedData.success) {
            setHorseOwnersValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchUpdateHorseOwner(horseOwnerId, updateData);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Владелец лошади успешно обновлен",
                });
                loadHorseOwners()
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
    }, [toast, loadHorseOwners]);

    const deleteHorseOwner = useCallback(async (horseOwnerId: UUID) => {
        const response = await fetchDeleteHorseOwner(horseOwnerId);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Владелец лошади успешно удален",
                });
                loadHorseOwners()
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
    }, [toast, loadHorseOwners]);


    const resetHorseOwnersValidation = useCallback(() => {
        setHorseOwnersValidationErrors({});
    }, []);

    const resetHorseOwnersFilters = useCallback(() => {
        setHorseOwnersFilters(defaultHorseOwnersFilters);
    }, []);

    return {
        horseOwners,
        horseOwnersTotal,
        horseOwnersLoading,
        horseOwnersFilters,
        setHorseOwnersFilters,
        horseOwnersValidationErrors,
        resetHorseOwnersValidation,
        resetHorseOwnersFilters,
        createHorseOwner,
        updateHorseOwner,
        deleteHorseOwner,
    };
};
