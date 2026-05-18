import { useCallback, useEffect, useMemo, useState } from "react";
import type { UUID } from "crypto";
import { isApiError, isApiSuccess } from "@/lib/apiStatus";
import {
    HorseOutDto,
    HorsePedigreeMode,
    HorseSetPedigreeInDto,
    HorseWithPedigreeOutDto,
} from "@/types/api/horses";
import {
    fetchAvailablePedigree,
    fetchHorse,
    fetchSetHorsePedigree,
} from "../services/horseService";
import { HORSE_PEDIGREE_MODE } from "../constants/pedigree";
import {
    HORSES_PAGE_SCOPES_ACTIONS,
    useHorsePageActionScopes,
} from "./useHorseScopes";

export const PEDIGREE_CANDIDATE_PAGE_SIZE = 10;

export type PedigreePickerIntent = {
    mode: HorsePedigreeMode;
    action: "add" | "replace";
    targetFoalId?: UUID;
};

const PEDIGREE_PERMISSION_ERROR = "Недостаточно прав для изменения родословной";
const PEDIGREE_MUTATION_ERROR = "Не удалось изменить родословную";
const PEDIGREE_REFRESH_ERROR = "Не удалось обновить родословную";
const CANDIDATES_LOAD_ERROR = "Не удалось загрузить кандидатов";

export const useHorsePedigree = (
    initialHorse: HorseWithPedigreeOutDto | null,
    open: boolean,
    onChanged?: () => void,
) => {
    const { hasPermission } = useHorsePageActionScopes();
    const canUpdatePedigree = hasPermission(HORSES_PAGE_SCOPES_ACTIONS.UPDATE_HORSE_PEDIGREE);

    const [horse, setHorse] = useState<HorseWithPedigreeOutDto | null>(initialHorse);
    const [pickerIntent, setPickerIntent] = useState<PedigreePickerIntent | null>(null);
    const [candidateSearch, setCandidateSearchState] = useState("");
    const [candidateOffset, setCandidateOffset] = useState(0);
    const [candidates, setCandidates] = useState<HorseOutDto[]>([]);
    const [candidatesTotal, setCandidatesTotal] = useState(0);
    const [candidatesLoading, setCandidatesLoading] = useState(false);
    const [candidatesError, setCandidatesError] = useState<string | null>(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState<UUID | null>(null);
    const [mutationLoading, setMutationLoading] = useState(false);
    const [operationError, setOperationError] = useState<string | null>(null);

    useEffect(() => {
        setHorse(initialHorse);
        setOperationError(null);
    }, [initialHorse]);

    const foals = useMemo(() => horse?.pedigree?.foals ?? [], [horse]);

    const loadCandidates = useCallback(async () => {
        if (!open || !horse?.id || !pickerIntent) return;

        setCandidatesLoading(true);
        setCandidatesError(null);
        const response = await fetchAvailablePedigree(horse.id, pickerIntent.mode, {
            search: candidateSearch || undefined,
            limit: PEDIGREE_CANDIDATE_PAGE_SIZE,
            offset: candidateOffset,
        });

        if (isApiSuccess(response)) {
            const items = response.data?.items ?? [];
            setCandidates(items);
            setCandidatesTotal(response.data?.total ?? 0);
            if (selectedCandidateId && !items.some((item) => item.id === selectedCandidateId)) {
                setSelectedCandidateId(null);
            }
        } else {
            setCandidates([]);
            setCandidatesTotal(0);
            setCandidatesError(
                isApiError(response) ? response.data.detail : CANDIDATES_LOAD_ERROR,
            );
        }
        setCandidatesLoading(false);
    }, [
        candidateOffset,
        candidateSearch,
        horse?.id,
        open,
        pickerIntent,
        selectedCandidateId,
    ]);

    useEffect(() => {
        loadCandidates();
    }, [loadCandidates]);

    const openPicker = useCallback((intent: PedigreePickerIntent) => {
        setPickerIntent(intent);
        setCandidateSearchState("");
        setCandidateOffset(0);
        setCandidates([]);
        setCandidatesTotal(0);
        setCandidatesError(null);
        setSelectedCandidateId(null);
        setOperationError(null);
    }, []);

    const closePicker = useCallback(() => {
        setPickerIntent(null);
        setSelectedCandidateId(null);
        setCandidatesError(null);
    }, []);

    const setCandidateSearch = useCallback((value: string) => {
        setCandidateSearchState(value);
        setCandidateOffset(0);
    }, []);

    const assertCanUpdatePedigree = useCallback((): boolean => {
        if (!horse?.id) return false;
        if (!canUpdatePedigree) {
            setOperationError(PEDIGREE_PERMISSION_ERROR);
            return false;
        }
        if (mutationLoading) return false;
        return true;
    }, [canUpdatePedigree, horse?.id, mutationLoading]);

    const refreshHorsePedigree = useCallback(async (): Promise<boolean> => {
        if (!horse?.id) return false;

        const detailResponse = await fetchHorse(horse.slug || horse.id.toString(), { pedigree: 1 });
        if (isApiSuccess(detailResponse) && detailResponse.data && "pedigree" in detailResponse.data) {
            setHorse(detailResponse.data);
            return true;
        }

        setOperationError(
            isApiError(detailResponse) ? detailResponse.data.detail : PEDIGREE_REFRESH_ERROR,
        );
        return false;
    }, [horse?.id, horse?.slug]);

    const submitPedigreeMutation = useCallback(
        async (payload: HorseSetPedigreeInDto): Promise<boolean> => {
            if (!horse?.id || !assertCanUpdatePedigree()) return false;

            setMutationLoading(true);
            setOperationError(null);

            const response = await fetchSetHorsePedigree(horse.id, payload);
            if (!isApiSuccess(response)) {
                setOperationError(
                    isApiError(response) ? response.data.detail : PEDIGREE_MUTATION_ERROR,
                );
                setMutationLoading(false);
                return false;
            }

            const refreshed = await refreshHorsePedigree();
            if (!refreshed) {
                onChanged?.();
                setMutationLoading(false);
                return false;
            }

            onChanged?.();
            setMutationLoading(false);
            return true;
        },
        [assertCanUpdatePedigree, horse?.id, onChanged, refreshHorsePedigree],
    );

    const removeSire = useCallback(
        () => submitPedigreeMutation({ sire_id: null }),
        [submitPedigreeMutation],
    );
    const removeDam = useCallback(
        () => submitPedigreeMutation({ dam_id: null }),
        [submitPedigreeMutation],
    );
    const removeFoal = useCallback(
        (foalId: UUID) => {
            const remainingFoals = foals
                .filter((foal) => foal.id !== foalId)
                .map((foal) => foal.id);
            return submitPedigreeMutation({ foals: remainingFoals });
        },
        [foals, submitPedigreeMutation],
    );

    const buildCandidatePayload = useCallback((): HorseSetPedigreeInDto | null => {
        if (!pickerIntent || !selectedCandidateId) return null;

        if (pickerIntent.mode === HORSE_PEDIGREE_MODE.SIRE) {
            return { sire_id: selectedCandidateId };
        }
        if (pickerIntent.mode === HORSE_PEDIGREE_MODE.DAM) {
            return { dam_id: selectedCandidateId };
        }
        const baseFoalIds = foals
            .filter((foal) => foal.id !== pickerIntent.targetFoalId)
            .map((foal) => foal.id);
        return { foals: [...baseFoalIds, selectedCandidateId] };
    }, [foals, pickerIntent, selectedCandidateId]);

    const saveCandidate = useCallback(async () => {
        const payload = buildCandidatePayload();
        if (!payload) return false;

        const success = await submitPedigreeMutation(payload);
        if (success) closePicker();
        return success;
    }, [buildCandidatePayload, closePicker, submitPedigreeMutation]);

    return {
        horse,
        canUpdatePedigree,
        pickerIntent,
        openPicker,
        closePicker,
        candidateSearch,
        setCandidateSearch,
        candidateOffset,
        setCandidateOffset,
        candidateLimit: PEDIGREE_CANDIDATE_PAGE_SIZE,
        candidates,
        candidatesTotal,
        candidatesLoading,
        candidatesError,
        selectedCandidateId,
        setSelectedCandidateId,
        mutationLoading,
        operationError,
        removeSire,
        removeDam,
        removeFoal,
        saveCandidate,
    };
};
