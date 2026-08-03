import { useState, useCallback, useRef } from "react";
import { API_STATUS } from "@/lib/apiStatus";
import { useNotification } from "@/hooks/useNotification";
import { zodErrorNormalize } from "@/lib/zodErrorNormalize";
import { UUID } from "crypto";
import {
    HorseServiceRelationAvailableServiceDto,
    HorseServiceRelationCreateInDto,
    HorseServiceRelationOutDto,
    HorseServiceRelationUpdateInDto,
} from "@/types/api/horseServiceRelations";
import {
    fetchHorseServiceRelations,
    fetchCreateHorseServiceRelation,
    fetchUpdateHorseServiceRelation,
    fetchDeleteHorseServiceRelation,
    fetchAvailableServices,
} from "../services/horseServiceRelationsService";
import {
    horseServiceRelationCreateSchema,
    horseServiceRelationUpdateSchema,
} from "../validators/horseServiceRelations";

export const useHorseServiceRelations = (onRefreshHorse?: (horseId: UUID) => void) => {
    const toast = useNotification();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedHorseId, setSelectedHorseId] = useState<UUID | null>(null);
    const [selectedHorseName, setSelectedHorseName] = useState<string>("");

    const [relations, setRelations] = useState<HorseServiceRelationOutDto[]>([]);
    const [relationsTotal, setRelationsTotal] = useState(0);
    const [relationsLoading, setRelationsLoading] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRelation, setSelectedRelation] = useState<HorseServiceRelationOutDto | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

    const [availableServices, setAvailableServices] = useState<HorseServiceRelationAvailableServiceDto[]>([]);
    const [availableServicesLoading, setAvailableServicesLoading] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const submittingRef = useRef(false);

    const loadRelations = useCallback(async (horseId: UUID) => {
        setRelationsLoading(true);
        const response = await fetchHorseServiceRelations(horseId);
        switch (response.status) {
            case API_STATUS.OK:
                setRelations(response.data?.items ?? []);
                setRelationsTotal(response.data?.total ?? 0);
                break;
            case API_STATUS.ERROR:
                toast.error({
                    title: "Ошибка",
                    description: "Не удалось загрузить услуги лошади",
                });
                break;
            default:
                toast.error({
                    title: "Ошибка",
                    description: "Неизвестная ошибка",
                });
                break;
        }
        setRelationsLoading(false);
    }, [toast]);

    const loadAvailableServices = useCallback(async (horseId: UUID, search?: string) => {
        setAvailableServicesLoading(true);
        const response = await fetchAvailableServices(horseId, { search });
        switch (response.status) {
            case API_STATUS.OK:
                setAvailableServices(response?.data || []);
                break;
            case API_STATUS.ERROR:
                toast.error({
                    title: "Ошибка",
                    description: "Не удалось загрузить доступные услуги",
                });
                break;
            default:
                break;
        }
        setAvailableServicesLoading(false);
    }, [toast]);

    const openDrawer = useCallback((horseId: UUID, horseName: string) => {
        setSelectedHorseId(horseId);
        setSelectedHorseName(horseName);
        setDrawerOpen(true);
        loadRelations(horseId);
    }, [loadRelations]);

    const closeDrawer = useCallback(() => {
        setDrawerOpen(false);
        setSelectedHorseId(null);
        setSelectedHorseName("");
        setRelations([]);
        setRelationsTotal(0);
        setModalOpen(false);
        setSelectedRelation(null);
        setValidationErrors({});
        setAvailableServices([]);
    }, []);

    const openCreateModal = useCallback(() => {
        setSelectedRelation(null);
        setValidationErrors({});
        setModalOpen(true);
        if (selectedHorseId) {
            loadAvailableServices(selectedHorseId);
        }
    }, [selectedHorseId, loadAvailableServices]);

    const openUpdateModal = useCallback((relation: HorseServiceRelationOutDto) => {
        setSelectedRelation(relation);
        setValidationErrors({});
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setSelectedRelation(null);
        setValidationErrors({});
        setAvailableServices([]);
    }, []);

    const resetValidation = useCallback(() => {
        setValidationErrors({});
    }, []);

    const createRelation = useCallback(async (createData: HorseServiceRelationCreateInDto) => {
        if (!selectedHorseId || submittingRef.current) return false;

        const validatedData = horseServiceRelationCreateSchema.safeParse(createData);
        if (!validatedData.success) {
            setValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }

        submittingRef.current = true;
        setSubmitting(true);
        try {
            const response = await fetchCreateHorseServiceRelation(selectedHorseId, createData);
            switch (response.status) {
                case API_STATUS.OK:
                    toast.success({
                        title: "Успешно",
                        description: "Услуга привязана к лошади",
                    });
                    loadRelations(selectedHorseId);
                    onRefreshHorse?.(selectedHorseId);
                    closeModal();
                    return true;
                case API_STATUS.ERROR:
                    toast.error({
                        title: "Ошибка",
                        description: response?.data?.detail || "Не удалось привязать услугу",
                    });
                    return false;
                default:
                    toast.error({
                        title: "Ошибка",
                        description: "Неизвестная ошибка",
                    });
                    return false;
            }
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    }, [selectedHorseId, toast, loadRelations, closeModal, onRefreshHorse]);

    const updateRelation = useCallback(async (relationId: UUID, updateData: HorseServiceRelationUpdateInDto) => {
        if (!selectedHorseId || submittingRef.current) return false;

        const validatedData = horseServiceRelationUpdateSchema.safeParse(updateData);
        if (!validatedData.success) {
            setValidationErrors(zodErrorNormalize(validatedData.error));
            return false;
        }

        submittingRef.current = true;
        setSubmitting(true);
        try {
            const response = await fetchUpdateHorseServiceRelation(selectedHorseId, relationId, updateData);
            switch (response.status) {
                case API_STATUS.OK:
                    toast.success({
                        title: "Успешно",
                        description: "Связь обновлена",
                    });
                    loadRelations(selectedHorseId);
                    onRefreshHorse?.(selectedHorseId);
                    closeModal();
                    return true;
                case API_STATUS.ERROR:
                    toast.error({
                        title: "Ошибка",
                        description: response?.data?.detail || "Не удалось обновить связь",
                    });
                    return false;
                default:
                    toast.error({
                        title: "Ошибка",
                        description: "Неизвестная ошибка",
                    });
                    return false;
            }
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    }, [selectedHorseId, toast, loadRelations, closeModal, onRefreshHorse]);

    const deleteRelation = useCallback(async (relationId: UUID) => {
        if (!selectedHorseId || submittingRef.current) return false;

        submittingRef.current = true;
        setSubmitting(true);
        try {
            const response = await fetchDeleteHorseServiceRelation(selectedHorseId, relationId);
            switch (response.status) {
                case API_STATUS.OK:
                    toast.success({
                        title: "Успешно",
                        description: "Услуга отвязана от лошади",
                    });
                    loadRelations(selectedHorseId);
                    onRefreshHorse?.(selectedHorseId);
                    closeModal();
                    return true;
                case API_STATUS.ERROR:
                    toast.error({
                        title: "Ошибка",
                        description: response?.data?.detail || "Не удалось отвязать услугу",
                    });
                    return false;
                default:
                    toast.error({
                        title: "Ошибка",
                        description: "Неизвестная ошибка",
                    });
                    return false;
            }
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    }, [selectedHorseId, toast, loadRelations, closeModal, onRefreshHorse]);

    return {
        drawerOpen,
        selectedHorseId,
        selectedHorseName,
        relations,
        relationsTotal,
        relationsLoading,
        modalOpen,
        selectedRelation,
        validationErrors,
        availableServices,
        availableServicesLoading,
        submitting,
        openDrawer,
        closeDrawer,
        openCreateModal,
        openUpdateModal,
        closeModal,
        resetValidation,
        createRelation,
        updateRelation,
        deleteRelation,
        loadAvailableServices,
    };
};
