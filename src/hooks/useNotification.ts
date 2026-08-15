import { useNotificationContext } from "@/contexts/NotificationContext";
import type { NotificationInstance } from "antd/es/notification/interface";

/**
 * Хук для использования уведомлений в любом компоненте приложения
 * @returns API для создания уведомлений
 */
export const useNotification = (): NotificationInstance => {
  const { api } = useNotificationContext();
  return api;
};
