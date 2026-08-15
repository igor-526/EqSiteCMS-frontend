import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Modal, Form, Select, Tag } from "antd";
import { CloseOutlined, SaveOutlined, PlusOutlined } from "@ant-design/icons";
import { UUID } from "crypto";
import {
  UserManagementOutDto,
  UserManagementCreateInDto,
  UserManagementUpdateInDto,
  UserManagementRoleOutDto,
} from "@/types/api/userManagement";
import { getRoleColor, getRoleLabel } from "../constants/roleColors";

type UserFormModalProps = {
  open: boolean;
  onClose: () => void;
  user: UserManagementOutDto | null; // null = create mode
  roles: UserManagementRoleOutDto[];
  rolesLoading: boolean;
  onCreate: (data: UserManagementCreateInDto) => Promise<boolean>;
  onUpdate: (id: UUID, data: UserManagementUpdateInDto) => Promise<boolean>;
  validationErrors: Record<string, string[]>;
  onResetValidation: () => void;
};

const PASSWORD_MIN_LENGTH = 8;

export const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  onClose,
  user,
  roles,
  rolesLoading,
  onCreate,
  onUpdate,
  validationErrors,
  onResetValidation,
}) => {
  const isEditMode = user !== null;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [selectedScopeIds, setSelectedScopeIds] = useState<UUID[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const submitGuard = useRef(false);

  useEffect(() => {
    if (open) {
      onResetValidation();
      setLocalError(null);
      if (user) {
        setUsername(user.username);
        setFirstName(user.first_name ?? "");
        setLastName(user.last_name ?? "");
        setMiddleName(user.middle_name ?? "");
        setSelectedScopeIds(user.scopes.map((s) => s.id));
        setPassword("");
        setConfirmPassword("");
      } else {
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setFirstName("");
        setLastName("");
        setMiddleName("");
        setSelectedScopeIds([]);
      }
    }
  }, [open, user, onResetValidation]);

  const validate = (): string | null => {
    if (!username.trim()) return "Username обязателен";
    if (!isEditMode) {
      if (!password) return "Пароль обязателен";
      if (password.length < PASSWORD_MIN_LENGTH)
        return `Пароль должен быть не менее ${PASSWORD_MIN_LENGTH} символов`;
      if (password !== confirmPassword) return "Пароли не совпадают";
    }
    if (isEditMode && password) {
      if (password.length < PASSWORD_MIN_LENGTH)
        return `Пароль должен быть не менее ${PASSWORD_MIN_LENGTH} символов`;
      if (password !== confirmPassword) return "Пароли не совпадают";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    if (submitGuard.current) return;
    submitGuard.current = true;
    setSubmitting(true);
    setLocalError(null);

    let ok = false;
    if (isEditMode) {
      const updateData: UserManagementUpdateInDto = {
        first_name: firstName || null,
        last_name: lastName || null,
        middle_name: middleName || null,
        scope_ids: selectedScopeIds,
      };
      ok = await onUpdate(user.id, updateData);
    } else {
      const createData: UserManagementCreateInDto = {
        username: username.trim(),
        password,
        confirm_password: confirmPassword,
        first_name: firstName || null,
        last_name: lastName || null,
        middle_name: middleName || null,
        scope_ids: selectedScopeIds,
      };
      ok = await onCreate(createData);
    }

    submitGuard.current = false;
    setSubmitting(false);
    if (ok) onClose();
  };

  // Объединяем локальные ошибки и серверные
  const displayError = localError || (validationErrors["detail"]?.[0] ?? null);

  const roleOptions = roles.map((r) => ({
    label: r.scope_name,
    value: r.id,
  }));

  return (
    <Modal
      open={open}
      title={
        isEditMode ? `Редактирование: ${user.username}` : "Новый пользователь"
      }
      onCancel={onClose}
      width={520}
      footer={[
        <Button
          key="cancel"
          color="default"
          variant="outlined"
          onClick={onClose}
        >
          <CloseOutlined /> Отмена
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          icon={isEditMode ? <SaveOutlined /> : <PlusOutlined />}
          onClick={handleSubmit}
        >
          {isEditMode ? "Сохранить" : "Создать"}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form layout="vertical" className="mt-4">
        <Form.Item label="Username" required>
          <Input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setLocalError(null);
            }}
            placeholder="username"
            disabled={isEditMode}
          />
        </Form.Item>
        {!isEditMode && (
          <>
            <Form.Item label="Пароль" required>
              <Input.Password
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLocalError(null);
                }}
                placeholder={`Минимум ${PASSWORD_MIN_LENGTH} символов`}
              />
            </Form.Item>
            <Form.Item label="Подтвердить пароль" required>
              <Input.Password
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setLocalError(null);
                }}
                placeholder="Повторите пароль"
              />
            </Form.Item>
          </>
        )}
        <Form.Item label="Фамилия">
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Фамилия"
          />
        </Form.Item>
        <Form.Item label="Имя">
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Имя"
          />
        </Form.Item>
        <Form.Item label="Отчество">
          <Input
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            placeholder="Отчество"
          />
        </Form.Item>
        <Form.Item label="Роли">
          <Select
            mode="multiple"
            allowClear
            placeholder="Выберите роли"
            value={selectedScopeIds}
            onChange={(values: UUID[]) => setSelectedScopeIds(values)}
            options={roleOptions}
            loading={rolesLoading}
            optionRender={(option) => (
              <Tag
                color={getRoleColor(option.label as string)}
                style={{ margin: 0 }}
              >
                {getRoleLabel(option.label as string)}
              </Tag>
            )}
            tagRender={(props) => (
              <Tag
                color={getRoleColor(props.label as string)}
                closable={props.closable}
                onClose={props.onClose}
                style={{ marginInlineEnd: 4 }}
              >
                {getRoleLabel(props.label as string)}
              </Tag>
            )}
          />
        </Form.Item>
        {displayError && (
          <div style={{ color: "#ff4d4f", marginTop: -8, marginBottom: 12 }}>
            {displayError}
          </div>
        )}
      </Form>
    </Modal>
  );
};
