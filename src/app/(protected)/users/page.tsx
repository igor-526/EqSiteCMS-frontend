"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import { UUID } from "crypto";
import { useUserContext } from "@/contexts/UserContext";
import { UserManagementOutDto } from "@/types/api/userManagement";
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
import { UsersTabsKey } from "@/features/user-management/ui/UsersTabs";
import { UsersUserDocumentationView } from "@/features/user-management/ui/UsersUserDocumentationView";
import { UsersDeveloperDocumentationView } from "@/features/user-management/ui/UsersDeveloperDocumentationView";

export default function UsersPage() {
  const router = useRouter();
  const { loading: userLoading, user: currentUser } = useUserContext();
  const canAccess = useCanAccessUserManagement();
  const isSuperUser = useIsSuperUser();
  const currentUserId = useCurrentUserId();
  const [activeTab, setActiveTab] = useState<UsersTabsKey>(UsersTabsKey.USERS);

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
    rolesError,
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
        setPage={setPage}
        setLimit={setLimit}
        onSearchChange={handleSearchChange}
        onAddUser={handleAddUser}
        onResetFilters={resetFilters}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {activeTab === UsersTabsKey.USERS && (
        <div className="mt-4" data-testid="users-table-region">
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
        </div>
      )}
      {activeTab === UsersTabsKey.USER_DOCS && <UsersUserDocumentationView />}
      {activeTab === UsersTabsKey.DEVELOPER_DOCS && <UsersDeveloperDocumentationView />}

      <UserFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        user={selectedUser}
        roles={roles}
        rolesLoading={rolesLoading}
        rolesError={rolesError}
        equestrianId={currentUser?.equestrian_id ?? null}
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
