import { useEffect, useState, useCallback } from "react";
import { useNotification } from "@/hooks/useNotification";
import { zodErrorNormalize } from "@/lib/zodErrorNormalize";
import { UUID } from "crypto";
import { SiteSettingListQueryParams, SiteSettingOutDto, SiteSettingsCreateInDto, SiteSettingsUpdateInDto } from "@/types/api/siteSettings";
import { fetchCreateSiteSetting, fetchDeleteSiteSetting, fetchSiteSettingList, fetchUpdateSiteSetting } from "../services/siteSettingsService";
import { siteSettingCreateSchema, siteSettingUpdateSchema } from "../validators/siteSettings";

const defaultSiteSettingsFilters: SiteSettingListQueryParams = {
    key: undefined,
    name: undefined,
    description: undefined,
    type: undefined,
    sort: [],
    limit: 25,
    offset: 0,
    full: true
};

export const useSiteSettings = () => {
    const toast = useNotification();
    const [siteSettings, setSiteSettings] = useState<SiteSettingOutDto[]>([]);
    const [siteSettingsFilters, setSiteSettingsFilters] = useState<SiteSettingListQueryParams>(defaultSiteSettingsFilters);
    const [siteSettingsTotal, setSiteSettingsTotal] = useState<number>(0);
    const [siteSettingsLoading, setSiteSettingsLoading] = useState<boolean>(false);
    const [siteSettingsValidationErrors, setSiteSettingsValidationErrors] = useState<Record<string, string[]>>({});


    const loadSiteSettings = useCallback(async () => {
        setSiteSettingsLoading(true);
        const response = await fetchSiteSettingList(siteSettingsFilters);
        console.log(response.data);

        switch (response.status) {
            case "ok":
                setSiteSettings(response?.data?.items || []);
                setSiteSettingsTotal(response?.data?.total || 0);
                break;
            case "error":
                toast.error({
                    title: "Ошибка",
                    description: "Не удалось загрузить настройки сайта",
                });
                break;
            default:
                toast.error({
                    title: "Ошибка",
                    description: "Неизвестная ошибка",
                });
                break;
        }
        setSiteSettingsLoading(false);
    }, [toast, siteSettingsFilters]);


    useEffect(() => {
        loadSiteSettings();
    }, [siteSettingsFilters, loadSiteSettings]);

    const createSiteSetting = useCallback(async (createData: SiteSettingsCreateInDto) => {
        const validatedData = siteSettingCreateSchema.safeParse(createData);
        if (!validatedData.success) {
            setSiteSettingsValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchCreateSiteSetting(createData);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Настройка сайта успешно создана",
                });
                loadSiteSettings()
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
    }, [toast, loadSiteSettings]);

    const updateSiteSetting = useCallback(async (siteSettingId: UUID, updateData: SiteSettingsUpdateInDto) => {
        const validatedData = siteSettingUpdateSchema.safeParse(updateData);
        if (!validatedData.success) {
            setSiteSettingsValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }
        const response = await fetchUpdateSiteSetting(siteSettingId, updateData);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Настройка сайта успешно обновлена",
                });
                loadSiteSettings()
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
    }, [toast, loadSiteSettings]);

    const deleteSiteSetting = useCallback(async (siteSettingId: UUID) => {
        const response = await fetchDeleteSiteSetting(siteSettingId);
        switch (response.status) {
            case "ok":
                toast.success({
                    title: "Успешно",
                    description: "Настройка сайта успешно удалена",
                });
                loadSiteSettings()
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
    }, [toast, loadSiteSettings]);


    const resetSiteSettingsValidation = useCallback(() => {
        setSiteSettingsValidationErrors({});
    }, []);

    const resetSiteSettingsFilters = useCallback(() => {
        setSiteSettingsFilters(defaultSiteSettingsFilters);
    }, []);

    return {
        siteSettings,
        siteSettingsTotal,
        siteSettingsLoading,
        siteSettingsFilters,
        setSiteSettingsFilters,
        siteSettingsValidationErrors,
        resetSiteSettingsValidation,
        resetSiteSettingsFilters,
        createSiteSetting,
        updateSiteSetting,
        deleteSiteSetting,
    };
};

