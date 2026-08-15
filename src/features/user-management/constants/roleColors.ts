/**
 * Цветовая карта ролей: от красного (наивысший) к зелёному (менее значимый).
 * Fallback — серый.
 */
export const ROLE_COLOR_MAP: Record<string, string> = {
  SUPERUSER: "#f5222d", // красный
  USER_MANAGER: "#fa8c16", // оранжевый
  ADMIN: "#faad14", // жёлтый
  DEVELOPER: "#52c41a", // зелёный
};

export const getRoleColor = (role: string): string =>
  ROLE_COLOR_MAP[role] ?? "#8c8c8c"; // fallback серый

export const ROLE_LABELS: Record<string, string> = {
  SUPERUSER: "Суперпользователь",
  USER_MANAGER: "Менеджер пользователей",
  ADMIN: "Администратор",
  DEVELOPER: "Разработчик",
};

export const getRoleLabel = (role: string): string => ROLE_LABELS[role] ?? role;
