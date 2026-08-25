import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { useUserContext } from "@/contexts/UserContext";

/**
 * Проверяет, имеет ли текущий пользователь доступ к странице управления
 * пользователями (USER_MANAGER или SUPERUSER).
 */
export const useCanAccessUserManagement = (): boolean => {
  const { scopes } = useUserContext();
  return (
    scopes.includes(KNOWN_USER_SCOPES.SUPERUSER) ||
    scopes.includes(KNOWN_USER_SCOPES.USER_MANAGER)
  );
};

/**
 * Возвращает true, если текущий пользователь — SUPERUSER.
 */
export const useIsSuperUser = (): boolean => {
  const { scopes } = useUserContext();
  return scopes.includes(KNOWN_USER_SCOPES.SUPERUSER);
};

/**
 * Возвращает ID текущего пользователя (для скрытия кнопок «Удалить/Заблокировать» на своей строке).
 */
export const useCurrentUserId = () => {
  const { user } = useUserContext();
  return user?.id ?? null;
};
