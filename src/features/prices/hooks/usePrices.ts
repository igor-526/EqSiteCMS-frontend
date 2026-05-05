import { useEffect, useState, useCallback } from "react";
import { fetchCreatePriceGroup, fetchDeletePriceGroup, fetchPriceGroupList, fetchUpdatePriceGroup } from "../services/priceGroupService";
import { PriceGroupCreateInDto, PriceGroupListQueryParams, PriceGroupOutDto, PriceGroupUpdateInDto } from "@/types/api/priceGroups";
import { useNotification } from "@/hooks/useNotification";
import { PriceCreateInDto, PriceListQueryParams, PriceOutDto, PriceUpdateInDto } from "@/types/api/prices";
import { zodErrorNormalize } from "@/lib/zodErrorNormalize";
import { priceCreateSchema, priceGroupCreateSchema, priceGroupUpdateSchema, priceUpdateSchema } from "../validators/prices";
import { UUID } from "crypto";
import { fetchCreatePrice, fetchDeletePrice, fetchPrice, fetchPriceList, fetchUpdatePrice, fetchUpdatePricePhotos } from "../services/priceService";
import { PhotoUpdateEntityInDto } from "@/types/api/photos";

const defaultPriceGroupsFilters: PriceGroupListQueryParams = {
    name: undefined,
    description: undefined,
    sort: [],
    limit: 25,
    offset: 0
};

const defaultPricesFilters: PriceListQueryParams = {
    name: undefined,
    description: undefined,
    groups: undefined,
    sort: [],
    limit: 25,
    offset: 0
};

export const usePrices = () => {
    const toast = useNotification();
    const [priceGroups, setPriceGroups] = useState<PriceGroupOutDto[]>([]);
    const [priceGroupsOptions, setPriceGroupsOptions] = useState<{ key: string, label: string, value: UUID }[]>([]);
    const [priceGroupsFilters, setPriceGroupsFilters] = useState<PriceGroupListQueryParams>(defaultPriceGroupsFilters);
    const [priceGroupsTotal, setPriceGroupsTotal] = useState<number>(0);
    const [priceGroupsLoading, setPriceGroupsLoading] = useState<boolean>(false);
    const [priceGroupsValidationErrors, setPriceGroupsValidationErrors] = useState<Record<string, string[]>>({});
    const [priceDetailLoading, setPriceDetailLoading] = useState<boolean>(false);
    const [priceDetail, setPriceDetail] = useState<PriceOutDto | null>(null);

    const [prices, setPrices] = useState<PriceOutDto[]>([]);
    const [pricesFilters, setPricesFilters] = useState<PriceListQueryParams>(defaultPricesFilters);
    const [pricesTotal, setPricesTotal] = useState<number>(0);
    const [pricesLoading, setPricesLoading] = useState<boolean>(false);
    const [pricesValidationErrors, setPricesValidationErrors] = useState<Record<string, string[]>>({});

    const loadPriceGroupsForOptions = useCallback(async () => {
        const response = await fetchPriceGroupList({ limit: 1000000, offset: 0 });
        switch (response.status) {
            case "ok":
                setPriceGroupsOptions(response?.data?.items.map((item) => ({ key: item.id.toString(), label: item.name, value: item.id })) || []);
                break;
            case "error":
                toast.error({
                    title: "Ошибка",
                    description: "Не удалось загрузить группы услуг",
                });
                break;
            default:
                toast.error({
                    title: "Ошибка",
                    description: "Неизвестная ошибка",
                });
                break;
        }
    }, [toast]);

    const loadPriceGroups = useCallback(async () => {
        setPriceGroupsLoading(true);
        const response = await fetchPriceGroupList(priceGroupsFilters);
        if (response.status === "ok") {
            setPriceGroups(response?.data?.items || []);
            setPriceGroupsTotal(response?.data?.total || 0);
            loadPriceGroupsForOptions();
        } else if (response.status === "error") {
            toast.error({
                title: "Ошибка",
                description: "Не удалось загрузить группы услуг",
            });
        } else {
            toast.error({
                title: "Ошибка",
                description: "Неизвестная ошибка",
            });
        }
        setPriceGroupsLoading(false);
    }, [toast, priceGroupsFilters, loadPriceGroupsForOptions]);

    const loadPrices = useCallback(async () => {
        setPricesLoading(true);
        const response = await fetchPriceList(pricesFilters);
        if (response.status === "ok") {
            setPrices(response?.data?.items || []);
            setPricesTotal(response?.data?.total || 0);
        } else if (response.status === "error") {
            toast.error({
                title: "Ошибка",
                description: "Не удалось загрузить цены",
            });
        } else {
            toast.error({
                title: "Ошибка",
                description: "Неизвестная ошибка",
            });
        }
        setPricesLoading(false);
    }, [toast, pricesFilters]);

    const loadPriceDetail = useCallback(async (priceId: UUID) => {
        setPriceDetailLoading(true);
        const response = await fetchPrice(priceId);
        if (response.status === "ok") {
            setPriceDetail(response?.data || null);
        } else if (response.status === "error") {
            toast.error({
                title: "Ошибка",
                description: "Не удалось загрузить цену",
            });
        } else {
            toast.error({
                title: "Ошибка",
                description: "Неизвестная ошибка",
            });
        }
        setPriceDetailLoading(false);
    }, [toast]);

    useEffect(() => {
        loadPriceGroups();
    }, [priceGroupsFilters, loadPriceGroups]);

    useEffect(() => {
        loadPrices();
    }, [pricesFilters, loadPrices]);

    const createPriceGroup = useCallback(async (createData: PriceGroupCreateInDto) => {
        const validatedData = priceGroupCreateSchema.safeParse(createData);
        if (!validatedData.success) {
            setPriceGroupsValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchCreatePriceGroup(createData);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Группа услуг успешно создана",
                });
                loadPriceGroups()
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
    }, [toast, loadPriceGroups]);

    const updatePriceGroup = useCallback(async (priceGroupId: UUID, updateData: PriceGroupUpdateInDto) => {
        const validatedData = priceGroupUpdateSchema.safeParse(updateData);
        if (!validatedData.success) {
            setPriceGroupsValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchUpdatePriceGroup(priceGroupId, updateData);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Группа услуг успешно обновлена",
                });
                loadPriceGroups()
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
    }, [toast, loadPriceGroups]);

    const deletePriceGroup = useCallback(async (priceGroupId: UUID) => {
        const response = await fetchDeletePriceGroup(priceGroupId);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Группа услуг успешно удалена",
                });
                loadPriceGroups()
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
    }, [toast, loadPriceGroups]);

    const createPrice = useCallback(async (createData: PriceCreateInDto) => {
        const validatedData = priceCreateSchema.safeParse(createData);
        if (!validatedData.success) {
            setPricesValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchCreatePrice(createData);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Цена успешно создана",
                });
                loadPrices()
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
    }, [toast, loadPrices]);

    const updatePrice = useCallback(async (priceId: UUID, updateData: PriceUpdateInDto) => {
        const validatedData = priceUpdateSchema.safeParse(updateData);
        if (!validatedData.success) {
            setPricesValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchUpdatePrice(priceId, updateData);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Цена успешно обновлена",
                });
                loadPrices()
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
    }, [toast, loadPrices]);

    const deletePrice = useCallback(async (priceId: UUID) => {
        const response = await fetchDeletePrice(priceId);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Цена успешно удалена",
                });
                loadPrices()
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
    }, [toast, loadPrices]);

    const resetPriceGroupsValidation = useCallback(() => {
        setPriceGroupsValidationErrors({});
    }, []);

    const resetPricesValidation = useCallback(() => {
        setPricesValidationErrors({});
    }, []);

    const resetPriceGroupsFilters = useCallback(() => {
        setPriceGroupsFilters(defaultPriceGroupsFilters);
    }, []);

    const resetPricesFilters = useCallback(() => {
        setPricesFilters(defaultPricesFilters);
    }, []);

    const updatePricePhotos = useCallback(async (priceId: UUID, updateData: PhotoUpdateEntityInDto) => {
        const response = await fetchUpdatePricePhotos(priceId, updateData);
        switch (response.status) {
            case "ok":
                loadPriceDetail(priceId);
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
    }, [toast, loadPriceDetail]);

    return {
        priceGroups,
        priceGroupsTotal,
        priceGroupsLoading,
        priceGroupsFilters,
        priceGroupsOptions,
        setPriceGroupsFilters,
        priceGroupsValidationErrors,
        resetPriceGroupsValidation,
        resetPriceGroupsFilters,
        createPriceGroup,
        updatePriceGroup,
        deletePriceGroup,
        prices,
        pricesTotal,
        pricesLoading,
        pricesFilters,
        setPricesFilters,
        pricesValidationErrors,
        resetPricesValidation,
        resetPricesFilters,
        createPrice,
        updatePrice,
        updatePricePhotos,
        deletePrice,
        priceDetail,
        priceDetailLoading,
        loadPriceDetail,
    };
};

