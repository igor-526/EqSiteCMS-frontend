import React from "react";
import { Button, Input } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { UserManagementListQueryParams } from "@/types/api/userManagement";
import { TablePaginator } from "@/ui";
import { FiltersBaseType, FiltersSetter } from "@/types/filters/filterBase";

type UsersHeaderProps = {
  total: number;
  filters: UserManagementListQueryParams;
  setFilters: (filters: Partial<UserManagementListQueryParams>) => void;
  setPage: (offset: number) => void;
  setLimit: (limit: number) => void;
  onSearchChange: (value: string | undefined) => void;
  onAddUser: () => void;
  onResetFilters: () => void;
};

export const UsersHeader: React.FC<UsersHeaderProps> = ({
  total,
  filters,
  setFilters,
  setPage,
  setLimit,
  onSearchChange,
  onAddUser,
  onResetFilters,
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Input
        placeholder="Поиск по ФИО"
        prefix={<SearchOutlined />}
        value={filters.search ?? ""}
        onChange={(e) => onSearchChange(e.target.value.trim() || undefined)}
        style={{ width: 220 }}
        allowClear
      />
      <TablePaginator
        filters={filters as FiltersBaseType}
        setFilters={
          ((
            updater: (
              prev: FiltersBaseType,
            ) => FiltersBaseType | FiltersBaseType,
          ) => {
            const prev = filters as FiltersBaseType;
            const resolved =
              typeof updater === "function" ? updater(prev) : updater;
            const newFilters = resolved as UserManagementListQueryParams;
            if (newFilters.limit !== prev.limit) {
              setLimit(newFilters.limit as number);
            } else {
              setPage(newFilters.offset as number);
            }
          }) as FiltersSetter<FiltersBaseType>
        }
        total={total}
      />
      <Button color="danger" variant="outlined" onClick={onResetFilters}>
        Сбросить
      </Button>
      <Button color="primary" variant="outlined" onClick={onAddUser}>
        <PlusOutlined /> Добавить
      </Button>
    </div>
  );
};
