"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUserContext } from "@/contexts/UserContext";
import { useNotification } from "@/hooks/useNotification";
import { isApiError, isApiSuccess } from "@/lib/apiStatus";
import type {
  EmailOutDto,
  NotificationSettingOutDto,
  VkBindingOutDto,
  VkBotInfoOutDto,
  VkIssueConfirmationOutDto,
} from "@/types/api/notifications";
import { VK_STATE } from "../constants";
import { emailSchema } from "../validators/email";
import {
  fetchMyEmail,
  fetchMyVkBinding,
  fetchNotificationSettings,
  fetchVkBotInfo,
  removeEmail,
  removeVkBinding,
  requestVkConfirmation,
  resendEmailConfirmation,
  saveEmail,
  saveNotificationSetting,
} from "../services/notificationService";

export type EmailModalMode = "create" | "change" | null;

const isMissingResource = (detail: string) =>
  /not found|не найден|отсутств/i.test(detail);

export function useNotifications() {
  const { user } = useUserContext();
  const notification = useNotification();
  const [email, setEmail] = useState<EmailOutDto | null>(null);
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailLoadError, setEmailLoadError] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettingOutDto[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [emailModalMode, setEmailModalMode] = useState<EmailModalMode>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [emailValidationError, setEmailValidationError] = useState<
    string | null
  >(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [emailPending, setEmailPending] = useState(false);
  const [settingPendingKey, setSettingPendingKey] = useState<string | null>(
    null,
  );
  const [vkBinding, setVkBinding] = useState<VkBindingOutDto | null>(null);
  const [vkLoading, setVkLoading] = useState(true);
  const [vkLoadError, setVkLoadError] = useState<string | null>(null);
  const [vkBotInfo, setVkBotInfo] = useState<VkBotInfoOutDto | null>(null);
  const [vkBotInfoError, setVkBotInfoError] = useState<string | null>(null);
  const [vkConfirmation, setVkConfirmation] =
    useState<VkIssueConfirmationOutDto | null>(null);
  const [vkPending, setVkPending] = useState(false);
  const [vkMutationError, setVkMutationError] = useState<string | null>(null);
  const [vkDeleteOpen, setVkDeleteOpen] = useState(false);
  const emailPendingRef = useRef(false);
  const settingPendingRef = useRef(false);
  const vkPendingRef = useRef(false);

  const loadEmail = useCallback(async () => {
    setEmailLoading(true);
    setEmailLoadError(null);
    const result = await fetchMyEmail();
    if (isApiSuccess(result)) {
      setEmail(result.data);
    } else if (isMissingResource(result.data.detail)) {
      setEmail(null);
    } else {
      setEmailLoadError(result.data.detail || "Не удалось загрузить email");
    }
    setEmailLoading(false);
  }, []);

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    const result = await fetchNotificationSettings();
    if (isApiSuccess(result)) setSettings(result.data ?? []);
    else
      setSettingsError(result.data.detail || "Не удалось загрузить настройки");
    setSettingsLoading(false);
  }, []);

  const loadVkBinding = useCallback(async () => {
    setVkLoading(true);
    setVkLoadError(null);
    const result = await fetchMyVkBinding();
    if (isApiSuccess(result)) {
      setVkBinding(result.data);
      if (result.data?.state !== VK_STATE.pending) setVkConfirmation(null);
    } else if (isMissingResource(result.data.detail)) {
      setVkBinding(null);
    } else {
      setVkLoadError(result.data.detail || "Не удалось загрузить привязку VK");
    }
    setVkLoading(false);
  }, []);

  const loadVkBotInfo = useCallback(async () => {
    setVkBotInfoError(null);
    const result = await fetchVkBotInfo();
    if (isApiSuccess(result)) setVkBotInfo(result.data);
    else {
      setVkBotInfo(null);
      setVkBotInfoError(result.data.detail || "Настройка VK не завершена");
    }
  }, []);

  useEffect(() => {
    void loadEmail();
    void loadSettings();
    void loadVkBinding();
    void loadVkBotInfo();
  }, [loadEmail, loadSettings, loadVkBinding, loadVkBotInfo]);

  const openEmailModal = useCallback(
    (mode: Exclude<EmailModalMode, null>) => {
      setEmailDraft(mode === "change" ? (email?.email ?? "") : "");
      setEmailValidationError(null);
      setMutationError(null);
      setEmailModalMode(mode);
    },
    [email],
  );

  const closeEmailModal = useCallback(() => {
    if (!emailPendingRef.current) setEmailModalMode(null);
  }, []);

  const submitEmail = useCallback(async () => {
    if (emailPendingRef.current || !user) return false;
    const validated = emailSchema.safeParse(emailDraft);
    if (!validated.success) {
      setEmailValidationError(
        validated.error.issues[0]?.message ?? "Некорректный email",
      );
      return false;
    }
    emailPendingRef.current = true;
    setEmailPending(true);
    setMutationError(null);
    setEmailValidationError(null);
    const result = await saveEmail(
      { user_id: String(user.id), email: validated.data },
      emailModalMode === "change",
    );
    emailPendingRef.current = false;
    setEmailPending(false);
    if (isApiSuccess(result)) {
      setEmailModalMode(null);
      notification.success({
        title: "Email сохранён",
        description: "Подтвердите адрес по ссылке из письма.",
      });
      await loadEmail();
      return true;
    }
    setMutationError(result.data.detail || "Не удалось сохранить email");
    return false;
  }, [emailDraft, emailModalMode, loadEmail, notification, user]);

  const deleteCurrentEmail = useCallback(async () => {
    if (emailPendingRef.current || !user) return false;
    emailPendingRef.current = true;
    setEmailPending(true);
    setMutationError(null);
    const result = await removeEmail(String(user.id));
    emailPendingRef.current = false;
    setEmailPending(false);
    if (isApiSuccess(result)) {
      setDeleteOpen(false);
      notification.success({ title: "Email удалён" });
      await loadEmail();
      return true;
    }
    setMutationError(result.data.detail || "Не удалось удалить email");
    return false;
  }, [loadEmail, notification, user]);

  const resendConfirmation = useCallback(async () => {
    if (emailPendingRef.current || !user) return false;
    emailPendingRef.current = true;
    setEmailPending(true);
    const result = await resendEmailConfirmation(String(user.id));
    emailPendingRef.current = false;
    setEmailPending(false);
    if (isApiSuccess(result)) {
      notification.success({
        title: "Письмо отправлено",
        description: "Проверьте почту.",
      });
      return true;
    }
    notification.error({
      title: "Не удалось отправить письмо",
      description: result.data.detail,
    });
    return false;
  }, [notification, user]);

  const issueVkCode = useCallback(async () => {
    if (vkPendingRef.current) return false;
    vkPendingRef.current = true;
    setVkPending(true);
    setVkMutationError(null);
    const result = await requestVkConfirmation();
    vkPendingRef.current = false;
    setVkPending(false);
    if (isApiSuccess(result) && result.data) {
      setVkConfirmation(result.data);
      notification.success({
        title: "Код получен",
        description: "Отправьте команду боту в диалоге VK.",
      });
      await loadVkBinding();
      return true;
    }
    const detail = isApiError(result)
      ? result.data.detail
      : "Не удалось получить код";
    setVkMutationError(detail || "Не удалось получить код");
    await loadVkBinding();
    return false;
  }, [loadVkBinding, notification]);

  const unlinkVk = useCallback(async () => {
    if (vkPendingRef.current || !user) return false;
    vkPendingRef.current = true;
    setVkPending(true);
    setVkMutationError(null);
    const result = await removeVkBinding(String(user.id));
    vkPendingRef.current = false;
    setVkPending(false);
    if (isApiSuccess(result)) {
      setVkDeleteOpen(false);
      setVkConfirmation(null);
      notification.success({ title: "VK отвязан" });
      await loadVkBinding();
      return true;
    }
    const detail = isApiError(result)
      ? result.data.detail
      : "Не удалось отвязать VK";
    setVkMutationError(detail || "Не удалось отвязать VK");
    return false;
  }, [loadVkBinding, notification, user]);

  const toggleSetting = useCallback(
    async (setting: NotificationSettingOutDto) => {
      if (settingPendingRef.current) return false;
      settingPendingRef.current = true;
      const key = `${setting.event_code}/${setting.channel_code}`;
      setSettingPendingKey(key);
      setSettingsError(null);
      const result = await saveNotificationSetting(
        setting.event_code,
        setting.channel_code,
        !setting.enabled,
      );
      settingPendingRef.current = false;
      setSettingPendingKey(null);
      if (isApiSuccess(result) && result.data) {
        setSettings((current) =>
          current.map((item) =>
            item.event_code === result.data!.event_code &&
            item.channel_code === result.data!.channel_code
              ? result.data!
              : item,
          ),
        );
        return true;
      }
      const detail = isApiError(result)
        ? result.data.detail
        : "Не удалось изменить настройку";
      setSettingsError(detail);
      notification.error({
        title: "Настройка не сохранена",
        description: detail,
      });
      return false;
    },
    [notification],
  );

  return {
    email,
    emailLoading,
    emailLoadError,
    settings,
    settingsLoading,
    settingsError,
    emailModalMode,
    emailDraft,
    emailValidationError,
    deleteOpen,
    mutationError,
    emailPending,
    settingPendingKey,
    setEmailDraft,
    setDeleteOpen,
    openEmailModal,
    closeEmailModal,
    submitEmail,
    deleteCurrentEmail,
    resendConfirmation,
    toggleSetting,
    reloadEmail: loadEmail,
    reloadSettings: loadSettings,
    vkBinding,
    vkLoading,
    vkLoadError,
    vkBotInfo,
    vkBotInfoError,
    vkConfirmation,
    vkPending,
    vkMutationError,
    vkDeleteOpen,
    setVkDeleteOpen,
    issueVkCode,
    unlinkVk,
    reloadVkBinding: loadVkBinding,
  };
}
