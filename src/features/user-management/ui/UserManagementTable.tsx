import React, { useMemo } from "react";
import { Tag, Tooltip } from "antd";
import type { TableColumnType } from "antd";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { UUID } from "crypto";
import {
  UserManagementOutDto,
  UserManagementListQueryParams,
} from "@/types/api/userManagement";
import { MainTable, StringFilter } from "@/ui";
import { getRoleColor, getRoleLabel } from "../constants/roleColors";
import { UserActionsCell } from "./UserActionsCell";

type UserManagementTableProps = {
  users: UserManagementOutDto[];
  loading: boolean;
  filters: UserManagementListQueryParams;
  setFilters: (filters: Partial<UserManagementListQueryParams>) => void;
  currentUserId: UUID | null;
  isSuperUser: boolean;
  onChangePassword: (user: UserManagementOutDto) => void;
  onToggleBlock: (user: UserManagementOutDto) => void;
  onDelete: (user: UserManagementOutDto) => void;
  onEdit: (user: UserManagementOutDto) => void;
};

const FILTER_ACTIVE_COLOR = "#1677ff";

const getFilterIconColor = (value: unknown): string | undefined =>
  (Array.isArray(value) ? value.length > 0 : Boolean(value))
    ? FILTER_ACTIVE_COLOR
    : undefined;

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  loading,
  filters,
  setFilters,
  currentUserId,
  isSuperUser,
  onChangePassword,
  onToggleBlock,
  onDelete,
  onEdit,
}) => {
  const tableData = useMemo(
    () => users.map((u) => ({ key: u.id.toString(), ...u })),
    [users],
  );

  const handleSortChange = (sort: string[]) => {
    setFilters({
      sort: sort as UserManagementListQueryParams["sort"],
      offset: 0,
    });
  };

  const columns: TableColumnType<Record<string, unknown>>[] = useMemo(
    () => [
      {
        title: "Username",
        dataIndex: "username",
        key: "username",
        sorter: true,
        filterDropdown: () => (
          <StringFilter
            value={filters.username}
            onChange={(v) => setFilters({ username: v, offset: 0 })}
            placeHolder="Username"
          />
        ),
        filterIcon: () => (
          <span style={{ color: getFilterIconColor(filters.username) }}>
            🔍
          </span>
        ),
      },
      {
        title: "Фамилия",
        dataIndex: "last_name",
        key: "last_name",
        sorter: true,
        filterDropdown: () => (
          <StringFilter
            value={filters.last_name}
            onChange={(v) => setFilters({ last_name: v, offset: 0 })}
            placeHolder="Фамилия"
          />
        ),
        filterIcon: () => (
          <span style={{ color: getFilterIconColor(filters.last_name) }}>
            🔍
          </span>
        ),
      },
      {
        title: "Имя",
        dataIndex: "first_name",
        key: "first_name",
        sorter: true,
        filterDropdown: () => (
          <StringFilter
            value={filters.first_name}
            onChange={(v) => setFilters({ first_name: v, offset: 0 })}
            placeHolder="Имя"
          />
        ),
        filterIcon: () => (
          <span style={{ color: getFilterIconColor(filters.first_name) }}>
            🔍
          </span>
        ),
      },
      {
        title: "Отчество",
        dataIndex: "middle_name",
        key: "middle_name",
        sorter: true,
        filterDropdown: () => (
          <StringFilter
            value={filters.middle_name}
            onChange={(v) => setFilters({ middle_name: v, offset: 0 })}
            placeHolder="Отчество"
          />
        ),
        filterIcon: () => (
          <span style={{ color: getFilterIconColor(filters.middle_name) }}>
            🔍
          </span>
        ),
      },
      {
        title: "Роль",
        dataIndex: "scopes",
        key: "scopes",
        render: (_: unknown, record: Record<string, unknown>) => {
          const user = record as unknown as UserManagementOutDto;
          return (
            <span className="flex flex-wrap gap-1">
              {(user.scopes ?? []).map((scope) => (
                <Tag
                  key={scope.id}
                  color={getRoleColor(scope.scope_name)}
                  style={{ margin: 0 }}
                >
                  {getRoleLabel(scope.scope_name)}
                </Tag>
              ))}
            </span>
          );
        },
      },
      {
        title: "Забл.",
        dataIndex: "is_blocked",
        key: "is_blocked",
        sorter: true,
        width: 70,
        align: "center" as const,
        render: (_: unknown, record: Record<string, unknown>) => {
          const user = record as unknown as UserManagementOutDto;
          return user.is_blocked ? (
            <Tooltip title="Заблокирован">
              <Tag color="red" icon={<LockOutlined />} style={{ margin: 0 }}>
                Да
              </Tag>
            </Tooltip>
          ) : (
            <Tooltip title="Активен">
              <Tag
                color="green"
                icon={<UnlockOutlined />}
                style={{ margin: 0 }}
              >
                Нет
              </Tag>
            </Tooltip>
          );
        },
      },
      {
        title: "Действия",
        key: "actions",
        width: 180,
        render: (_: unknown, record: Record<string, unknown>) => {
          const user = record as unknown as UserManagementOutDto;
          return (
            <UserActionsCell
              user={user}
              currentUserId={currentUserId}
              isSuperUser={isSuperUser}
              onChangePassword={onChangePassword}
              onToggleBlock={onToggleBlock}
              onDelete={onDelete}
            />
          );
        },
      },
    ],
    [
      filters,
      setFilters,
      currentUserId,
      isSuperUser,
      onChangePassword,
      onToggleBlock,
      onDelete,
    ],
  );

  return (
    <MainTable
      сolumns={columns}
      data={tableData}
      loading={loading}
      onSortChange={handleSortChange}
      currentSort={filters.sort}
      onRow={(record) => ({
        onClick: () => onEdit(record as unknown as UserManagementOutDto),
        style: { cursor: "pointer" },
      })}
    />
  );
};
