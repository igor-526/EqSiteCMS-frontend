"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import { UUID } from "crypto";
import { useUserContext } from "@/contexts/UserContext";
import {
  UserManagementOutDto,
  UserManagementCreateInDto,
  UserManagementUpdateInDto,
  UserManagementChangePasswordInDto,
} from "@/types/api/userManagement";
import { useUserManagement } from "@/features/user-management/hooks/useUserManagement";
import {
  useCanAccessUserManagement,
  useIsSuperUser,
  useCurrentUserId,
} from "@/features/user-management/hooks/useUserManagementScopes";
import { UsersHeader } from "@/features/user-management/ui/UsersHeader";
import { UserManagementTable } from "@/features/user-management/ui/UserManagementTable";
import { UserFormModal } from "@/features/user-management/ui/UserFormModal";
import { ChangePasswordModal } from "@/features/user-management/ui/ChangePasswordModal";
import { ConfirmBlockModal } from "@/features/user-management/ui/ConfirmBlockModal";
import { ConfirmDeleteModal } from "@/features/user-management/ui/ConfirmDeleteModal";

export default function UsersPage() {
  const router = useRouter();
  const { loading: userLoading } = useUserContext();
  const canAccess = useCanAccessUserManagement();
  const isSuperUser = useIsSuperUser();
  const currentUserId = useCurrentUserId();

  // ── Модальные окна ───────────────────────────────────────────
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserManagementOutDto | null>(
    null,
  );
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<UserManagementOutDto | null>(
    null,
  );
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockUser, setBlockUser] = useState<UserManagementOutDto | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserManagementOutDto | null>(
    null,
  );

  const {
    users,
    total,
    loading,
    filters,
    setFilters,
    setPage,
    setLimit,
    resetFilters,
    validationErrors,
    resetValidation,
    roles,
    rolesLoading,
    createUser,
    updateUser,
    deleteUser: deleteUserAction,
    blockUser: blockUserAction,
    unblockUser: unblockUserAction,
    changePassword,
  } = useUserManagement();

  // ── Редирект при отсутствии доступа ──────────────────────────
  useEffect(() => {
    if (!userLoading && !canAccess) {
      router.replace("/dashboard");
    }
  }, [userLoading, canAccess, router]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      setFilters({ search: value });
    },
    [setFilters],
  );

  const handleAddUser = useCallback(() => {
    setSelectedUser(null);
    setFormModalOpen(true);
  }, []);

  const handleEditUser = useCallback((user: UserManagementOutDto) => {
    setSelectedUser(user);
    setFormModalOpen(true);
  }, []);

  const handleChangePassword = useCallback((user: UserManagementOutDto) => {
    setPasswordUser(user);
    setPasswordModalOpen(true);
  }, []);

  const handleToggleBlock = useCallback((user: UserManagementOutDto) => {
    setBlockUser(user);
    setBlockModalOpen(true);
  }, []);

  const handleDelete = useCallback((user: UserManagementOutDto) => {
    setDeleteUser(user);
    setDeleteModalOpen(true);
  }, []);

  const handleBlockConfirm = useCallback(
    async (userId: UUID): Promise<boolean> => {
      const user = blockUser;
      if (!user) return false;
      return user.is_blocked
        ? unblockUserAction(userId)
        : blockUserAction(userId);
    },
    [blockUser, blockUserAction, unblockUserAction],
  );

  // Если пользователь ещё не загружен или нет доступа — показываем спиннер
  if (userLoading || !canAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <UsersHeader
        total={total}
        filters={filters}
        setFilters={setFilters}
        setPage={setPage}
        setLimit={setLimit}
        onSearchChange={handleSearchChange}
        onAddUser={handleAddUser}
        onResetFilters={resetFilters}
      />

      <UserManagementTable
        users={users}
        loading={loading}
        filters={filters}
        setFilters={setFilters}
        currentUserId={currentUserId}
        isSuperUser={isSuperUser}
        onChangePassword={handleChangePassword}
        onToggleBlock={handleToggleBlock}
        onDelete={handleDelete}
        onEdit={handleEditUser}
      />

      <UserFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        user={selectedUser}
        roles={roles}
        rolesLoading={rolesLoading}
        onCreate={createUser}
        onUpdate={updateUser}
        validationErrors={validationErrors}
        onResetValidation={resetValidation}
      />

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        user={passwordUser}
        onSubmit={changePassword}
      />

      <ConfirmBlockModal
        open={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        user={blockUser}
        onConfirm={handleBlockConfirm}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        user={deleteUser}
        onConfirm={deleteUserAction}
      />
    </>
  );
}
