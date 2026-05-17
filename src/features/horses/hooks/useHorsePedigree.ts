import { useCallback, useEffect, useMemo, useState } from "react";
import type { UUID } from "crypto";
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
import {
    HORSES_PAGE_SCOPES_ACTIONS,
    useHorsePageActionScopes,
} from "./useHorseScopes";

const CANDIDATE_LIMIT = 10;

export type PedigreePickerIntent = {
    mode: HorsePedigreeMode;
    action: "add" | "replace";
    targetFoalId?: UUID;
};

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
            limit: CANDIDATE_LIMIT,
            offset: candidateOffset,
        });

        if (response.status === "ok") {
            const items = response.data?.items ?? [];
            setCandidates(items);
            setCandidatesTotal(response.data?.total ?? 0);
            if (selectedCandidateId && !items.some((item) => item.id === selectedCandidateId)) {
                setSelectedCandidateId(null);
            }
        } else {
            setCandidates([]);
            setCandidatesTotal(0);
            setCandidatesError(response.data?.detail || "Не удалось загрузить кандидатов");
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

    const applyMutation = useCallback(
        async (payload: HorseSetPedigreeInDto) => {
            if (!horse?.id) return false;
            if (!canUpdatePedigree) {
                setOperationError("Недостаточно прав для изменения родословной");
                return false;
            }
            if (mutationLoading) return false;

            setMutationLoading(true);
            setOperationError(null);
            const response = await fetchSetHorsePedigree(horse.id, payload);
            if (response.status === "ok") {
                const detailResponse = await fetchHorse(horse.slug || horse.id.toString(), { pedigree: 1 });
                if (detailResponse.status === "ok" && detailResponse.data && "pedigree" in detailResponse.data) {
                    setHorse(detailResponse.data);
                } else {
                    setOperationError(
                        detailResponse.status === "error"
                            ? detailResponse.data?.detail || "Не удалось обновить родословную"
                            : "Не удалось обновить родословную",
                    );
                    onChanged?.();
                    setMutationLoading(false);
                    return false;
                }
                onChanged?.();
                setMutationLoading(false);
                return true;
            }

            setOperationError(response.data?.detail || "Не удалось изменить родословную");
            setMutationLoading(false);
            return false;
        },
        [canUpdatePedigree, horse?.id, horse?.slug, mutationLoading, onChanged],
    );

    const removeSire = useCallback(() => applyMutation({ sire_id: null }), [applyMutation]);
    const removeDam = useCallback(() => applyMutation({ dam_id: null }), [applyMutation]);
    const removeFoal = useCallback(
        (foalId: UUID) => {
            const remainingFoals = foals
                .filter((foal) => foal.id !== foalId)
                .map((foal) => foal.id);
            return applyMutation({ foals: remainingFoals });
        },
        [applyMutation, foals],
    );

    const saveCandidate = useCallback(async () => {
        if (!pickerIntent || !selectedCandidateId) return false;

        let payload: HorseSetPedigreeInDto;
        if (pickerIntent.mode === "sire") {
            payload = { sire_id: selectedCandidateId };
        } else if (pickerIntent.mode === "dam") {
            payload = { dam_id: selectedCandidateId };
        } else {
            const baseFoalIds = foals
                .filter((foal) => foal.id !== pickerIntent.targetFoalId)
                .map((foal) => foal.id);
            payload = { foals: [...baseFoalIds, selectedCandidateId] };
        }

        const success = await applyMutation(payload);
        if (success) closePicker();
        return success;
    }, [applyMutation, closePicker, foals, pickerIntent, selectedCandidateId]);

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
        candidateLimit: CANDIDATE_LIMIT,
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
