import React from "react";
import { Button, Tooltip, Popconfirm } from "antd";
import {
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { UUID } from "crypto";
import { UserManagementOutDto } from "@/types/api/userManagement";
import { KNOWN_USER_SCOPES } from "@/types/api/user";

type UserActionsCellProps = {
  user: UserManagementOutDto;
  currentUserId: UUID | null;
  isSuperUser: boolean;
  onChangePassword: (user: UserManagementOutDto) => void;
  onToggleBlock: (user: UserManagementOutDto) => void;
  onDelete: (user: UserManagementOutDto) => void;
};

/**
 * Кнопки действий в строке таблицы.
 *
 * Видимость:
 * - Если строка SUPERUSER и текущий НЕ SUPERUSER → все кнопки скрыты.
 * - Если строка = текущий пользователь → удаление/блокировка скрыты (только смена пароля).
 * - Для SUPERUSER: видны все кнопки (кроме самого себя — удаление/блокировка скрыты).
 */
export const UserActionsCell: React.FC<UserActionsCellProps> = ({
  user,
  currentUserId,
  isSuperUser,
  onChangePassword,
  onToggleBlock,
  onDelete,
}) => {
  const isSelf = user.id === currentUserId;
  const isTargetSuperUser = user.scopes.some(
    (s) => s.scope_name === KNOWN_USER_SCOPES.SUPERUSER,
  );

  // UM не может управлять SU-строками
  if (!isSuperUser && isTargetSuperUser) {
    return <span style={{ color: "#999" }}>—</span>;
  }

  const canDeleteOrBlock = !isSelf;

  return (
    <span
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <Tooltip title="Сменить пароль">
        <Button
          type="text"
          size="small"
          icon={<KeyOutlined />}
          onClick={() => onChangePassword(user)}
        />
      </Tooltip>

      {canDeleteOrBlock && (
        <>
          <Tooltip title={user.is_blocked ? "Разблокировать" : "Заблокировать"}>
            <Button
              type="text"
              size="small"
              danger={!user.is_blocked}
              icon={user.is_blocked ? <UnlockOutlined /> : <LockOutlined />}
              onClick={() => onToggleBlock(user)}
            />
          </Tooltip>

          <Popconfirm
            title="Удалить пользователя"
            description="Действие необратимо без участия разработчика. Продолжить?"
            okText="Удалить"
            okType="danger"
            cancelText="Отмена"
            onConfirm={() => onDelete(user)}
          >
            <Tooltip title="Удалить">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </>
      )}
    </span>
  );
};
