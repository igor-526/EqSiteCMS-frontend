import { useCallback, useEffect, useState } from "react";
import { API_STATUS, isApiSuccess } from "@/lib/apiStatus";
import { useNotification } from "@/hooks/useNotification";
import { UUID } from "crypto";
import {
  UserManagementOutDto,
  UserManagementCreateInDto,
  UserManagementUpdateInDto,
  UserManagementChangePasswordInDto,
  UserManagementListQueryParams,
  UserManagementRoleOutDto,
} from "@/types/api/userManagement";
import {
  fetchUserManagementList,
  fetchUserManagementCreate,
  fetchUserManagementUpdate,
  fetchUserManagementDelete,
  fetchUserManagementBlock,
  fetchUserManagementUnblock,
  fetchUserManagementChangePassword,
  fetchRolesList,
} from "../services/userManagementService";

const DEFAULT_LIMIT = 25;

const defaultFilters: UserManagementListQueryParams = {
  limit: DEFAULT_LIMIT,
  offset: 0,
  sort: [],
  search: undefined,
  username: undefined,
  first_name: undefined,
  last_name: undefined,
  middle_name: undefined,
  is_blocked: undefined,
  scope_ids: undefined,
};

export const useUserManagement = () => {
  const toast = useNotification();

  // ── Список пользователей ─────────────────────────────────────
  const [users, setUsers] = useState<UserManagementOutDto[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] =
    useState<UserManagementListQueryParams>(defaultFilters);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  // ── Роли (для селектора) ─────────────────────────────────────
  const [roles, setRoles] = useState<UserManagementRoleOutDto[]>([]);
  const [rolesLoading, setRolesLoading] = useState<boolean>(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const response = await fetchUserManagementList(filters);
    switch (response.status) {
      case API_STATUS.OK:
        setUsers(response.data?.items ?? []);
        setTotal(response.data?.total ?? 0);
        break;
      case API_STATUS.ERROR:
        setError(response.data?.detail ?? "Не удалось загрузить пользователей");
        toast.error({
          title: "Ошибка",
          description:
            response.data?.detail ?? "Не удалось загрузить пользователей",
        });
        break;
      default:
        setError("Неизвестная ошибка");
        toast.error({ title: "Ошибка", description: "Неизвестная ошибка" });
    }
    setLoading(false);
  }, [toast, filters]);

  const loadRoles = useCallback(async (search?: string) => {
    setRolesLoading(true);
    setRolesError(null);
    const response = await fetchRolesList(search ? { scope_name: search } : {});
    if (isApiSuccess(response)) {
      setRoles(response.data ?? []);
    } else {
      setRoles([]);
      const detail = response.data?.detail ?? "";
      if (/401|authentication|unauthorized/i.test(detail)) {
        setRolesError("Сессия истекла. Войдите снова, чтобы загрузить роли.");
      } else if (/403|forbidden|permission|недостаточно прав/i.test(detail)) {
        setRolesError("Недостаточно прав для просмотра ролей.");
      } else {
        setRolesError(detail || "Не удалось загрузить роли.");
      }
    }
    setRolesLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [filters, loadUsers]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // ── Фильтры ──────────────────────────────────────────────────
  const setFilters = useCallback(
    (newFilters: Partial<UserManagementListQueryParams>) => {
      setFiltersState((prev) => ({ ...prev, ...newFilters, offset: 0 }));
    },
    [],
  );

  const setFiltersRaw = useCallback(
    (updater: React.SetStateAction<UserManagementListQueryParams>) => {
      setFiltersState(updater);
    },
    [],
  );

  const setPage = useCallback((offset: number) => {
    setFiltersState((prev) => ({ ...prev, offset }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setFiltersState((prev) => ({ ...prev, limit, offset: 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  const resetValidation = useCallback(() => {
    setValidationErrors({});
  }, []);

  // ── CRUD ─────────────────────────────────────────────────────
  const createUser = useCallback(
    async (data: UserManagementCreateInDto): Promise<boolean> => {
      const response = await fetchUserManagementCreate(data);
      if (isApiSuccess(response)) {
        toast.success({ title: "Успешно", description: "Пользователь создан" });
        loadUsers();
        return true;
      }
      // Если detail содержит массив ошибок валидации
      const detail = response.data?.detail;
      if (detail && typeof detail === "object") {
        setValidationErrors(detail as Record<string, string[]>);
      } else {
        toast.error({
          title: "Ошибка",
          description: detail ?? "Не удалось создать пользователя",
        });
      }
      return false;
    },
    [toast, loadUsers],
  );

  const updateUser = useCallback(
    async (id: UUID, data: UserManagementUpdateInDto): Promise<boolean> => {
      const response = await fetchUserManagementUpdate(id, data);
      if (isApiSuccess(response)) {
        toast.success({
          title: "Успешно",
          description: "Пользователь обновлён",
        });
        loadUsers();
        return true;
      }
      const detail = response.data?.detail;
      if (detail && typeof detail === "object") {
        setValidationErrors(detail as Record<string, string[]>);
      } else {
        toast.error({
          title: "Ошибка",
          description: detail ?? "Не удалось обновить пользователя",
        });
      }
      return false;
    },
    [toast, loadUsers],
  );

  const deleteUser = useCallback(
    async (id: UUID): Promise<boolean> => {
      const response = await fetchUserManagementDelete(id);
      if (isApiSuccess(response)) {
        toast.success({ title: "Успешно", description: "Пользователь удалён" });
        loadUsers();
        return true;
      }
      toast.error({
        title: "Ошибка",
        description: response.data?.detail ?? "Не удалось удалить пользователя",
      });
      return false;
    },
    [toast, loadUsers],
  );

  const blockUser = useCallback(
    async (id: UUID): Promise<boolean> => {
      const response = await fetchUserManagementBlock(id);
      if (isApiSuccess(response)) {
        toast.success({
          title: "Успешно",
          description: "Пользователь заблокирован",
        });
        loadUsers();
        return true;
      }
      toast.error({
        title: "Ошибка",
        description:
          response.data?.detail ?? "Не удалось заблокировать пользователя",
      });
      return false;
    },
    [toast, loadUsers],
  );

  const unblockUser = useCallback(
    async (id: UUID): Promise<boolean> => {
      const response = await fetchUserManagementUnblock(id);
      if (isApiSuccess(response)) {
        toast.success({
          title: "Успешно",
          description: "Пользователь разблокирован",
        });
        loadUsers();
        return true;
      }
      toast.error({
        title: "Ошибка",
        description:
          response.data?.detail ?? "Не удалось разблокировать пользователя",
      });
      return false;
    },
    [toast, loadUsers],
  );

  const changePassword = useCallback(
    async (
      id: UUID,
      data: UserManagementChangePasswordInDto,
    ): Promise<boolean> => {
      const response = await fetchUserManagementChangePassword(id, data);
      if (isApiSuccess(response)) {
        toast.success({ title: "Успешно", description: "Пароль изменён" });
        return true;
      }
      toast.error({
        title: "Ошибка",
        description: response.data?.detail ?? "Не удалось изменить пароль",
      });
      return false;
    },
    [toast],
  );

  return {
    // Список
    users,
    total,
    loading,
    error,
    filters,
    setFilters,
    setFiltersRaw,
    setPage,
    setLimit,
    resetFilters,
    // Валидация
    validationErrors,
    resetValidation,
    // Роли
    roles,
    rolesLoading,
    rolesError,
    loadRoles,
    // CRUD
    createUser,
    updateUser,
    deleteUser,
    blockUser,
    unblockUser,
    changePassword,
    // Перезагрузка
    loadUsers,
  };
};
