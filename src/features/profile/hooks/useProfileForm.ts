import { useState, useEffect, useCallback } from "react";
import { isApiSuccess, isApiError } from "@/lib/apiStatus";
import { useNotification } from "@/hooks/useNotification";
import { useUserContext } from "@/contexts/UserContext";
import { fetchMyProfile, saveProfile } from "../services/profileService";
import { updateProfileSchema } from "../validators/profile";
import type { UserProfile, UpdateProfileInDto } from "@/types/api/user";

export type ProfileFormState = {
    first_name: string;
    last_name: string;
    middle_name: string;
};

export type UseProfileFormReturn = {
    profile: UserProfile | null;
    loading: boolean;
    formState: ProfileFormState;
    isDirty: boolean;
    saving: boolean;
    setFormState: (state: ProfileFormState) => void;
    setField: (field: keyof ProfileFormState, value: string) => void;
    save: () => Promise<void>;
    reset: () => void;
};

function toFormState(profile: UserProfile | null): ProfileFormState {
    return {
        first_name: profile?.first_name ?? "",
        last_name: profile?.last_name ?? "",
        middle_name: profile?.middle_name ?? "",
    };
}

function statesAreEqual(a: ProfileFormState, b: ProfileFormState): boolean {
    return a.first_name === b.first_name &&
        a.last_name === b.last_name &&
        a.middle_name === b.middle_name;
}

export function useProfileForm(): UseProfileFormReturn {
    const notification = useNotification();
    const { refreshUser } = useUserContext();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formState, setFormState] = useState<ProfileFormState>({ first_name: "", last_name: "", middle_name: "" });
    const [loadedState, setLoadedState] = useState<ProfileFormState>({ first_name: "", last_name: "", middle_name: "" });

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchMyProfile().then((result) => {
            if (cancelled) return;
            if (isApiSuccess(result) && result.data) {
                const loaded = toFormState(result.data);
                setProfile(result.data);
                setFormState(loaded);
                setLoadedState(loaded);
            } else {
                notification.error({ title: "Ошибка", description: "Не удалось загрузить профиль" });
            }
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    const isDirty = !statesAreEqual(formState, loadedState);

    const setField = useCallback((field: keyof ProfileFormState, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    }, []);

    const reset = useCallback(() => {
        setFormState(loadedState);
    }, [loadedState]);

    const save = useCallback(async () => {
        const payload: UpdateProfileInDto = {
            first_name: formState.first_name.trim() || null,
            last_name: formState.last_name.trim() || null,
            middle_name: formState.middle_name.trim() || null,
        };

        const validation = updateProfileSchema.safeParse(payload);
        if (!validation.success) {
            const messages = validation.error.issues.map((e) => e.message).join(", ");
            notification.error({ title: "Ошибка валидации", description: messages });
            return;
        }

        setSaving(true);
        const result = await saveProfile(payload);
        setSaving(false);

        if (isApiSuccess(result) && result.data) {
            const updated = toFormState(result.data);
            setProfile(result.data);
            setLoadedState(updated);
            setFormState(updated);
            notification.success({ title: "Успешно", description: "Изменения сохранены" });
            await refreshUser();
        } else if (isApiError(result)) {
            notification.error({ title: "Ошибка", description: result.data.detail || "Ошибка при сохранении" });
        }
    }, [formState, notification, refreshUser]);

    return {
        profile,
        loading,
        formState,
        isDirty,
        saving,
        setFormState,
        setField,
        save,
        reset,
    };
}
