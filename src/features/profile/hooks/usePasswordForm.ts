import { useState, useCallback } from "react";
import { isApiSuccess, isApiError } from "@/lib/apiStatus";
import { useNotification } from "@/hooks/useNotification";
import { saveNewPassword } from "../services/profileService";
import { changePasswordSchema } from "../validators/profile";

export type PasswordFormState = {
    current_password: string;
    new_password: string;
    confirm_new_password: string;
};

export type UsePasswordFormReturn = {
    formState: PasswordFormState;
    passwordStrength: number;
    strengthLabel: string;
    strengthColor: string;
    saving: boolean;
    setField: (field: keyof PasswordFormState, value: string) => void;
    changePassword: () => Promise<void>;
    clear: () => void;
};

const MIN_PASSWORD_LENGTH = 8;

function computePasswordStrength(password: string): number {
    if (!password) return 0;
    let score = 0;
    if (password.length >= MIN_PASSWORD_LENGTH) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}

function getStrengthLabel(strength: number): string {
    if (strength === 0) return "";
    if (strength === 1) return "Слабый";
    if (strength === 2) return "Средний";
    if (strength === 3) return "Хороший";
    return "Надёжный";
}

function getStrengthColor(strength: number): string {
    if (strength === 0) return "";
    if (strength === 1) return "red";
    if (strength === 2) return "orange";
    if (strength === 3) return "green";
    return "#006400";
}

const EMPTY_FORM: PasswordFormState = {
    current_password: "",
    new_password: "",
    confirm_new_password: "",
};

export function usePasswordForm(): UsePasswordFormReturn {
    const notification = useNotification();
    const [formState, setFormState] = useState<PasswordFormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const passwordStrength = computePasswordStrength(formState.new_password);
    const strengthLabel = getStrengthLabel(passwordStrength);
    const strengthColor = getStrengthColor(passwordStrength);

    const setField = useCallback((field: keyof PasswordFormState, value: string) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    }, []);

    const clear = useCallback(() => {
        setFormState(EMPTY_FORM);
    }, []);

    const changePassword = useCallback(async () => {
        const validation = changePasswordSchema.safeParse(formState);
        if (!validation.success) {
            const messages = validation.error.issues.map((e) => e.message).join(", ");
            notification.error({ title: "Ошибка валидации", description: messages });
            return;
        }

        setSaving(true);
        const result = await saveNewPassword(formState);
        setSaving(false);

        if (isApiSuccess(result)) {
            notification.success({ title: "Успешно", description: "Пароль успешно изменён" });
            setFormState(EMPTY_FORM);
        } else if (isApiError(result)) {
            notification.error({ title: "Ошибка", description: result.data.detail || "Ошибка при смене пароля" });
        }
    }, [formState, notification]);

    return {
        formState,
        passwordStrength,
        strengthLabel,
        strengthColor,
        saving,
        setField,
        changePassword,
        clear,
    };
}
