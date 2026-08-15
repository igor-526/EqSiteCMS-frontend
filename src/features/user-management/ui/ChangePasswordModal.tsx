import React, { useEffect, useState, useRef } from "react";
import { Button, Input, Modal, Form } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { UUID } from "crypto";
import {
  UserManagementOutDto,
  UserManagementChangePasswordInDto,
} from "@/types/api/userManagement";

type ChangePasswordModalProps = {
  open: boolean;
  onClose: () => void;
  user: UserManagementOutDto | null;
  onSubmit: (
    userId: UUID,
    data: UserManagementChangePasswordInDto,
  ) => Promise<boolean>;
};

const PASSWORD_MIN_LENGTH = 8;

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  onClose,
  user,
  onSubmit,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitGuard = useRef(false);

  useEffect(() => {
    if (open) {
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
    }
  }, [open]);

  const validate = (): string | null => {
    if (!newPassword) return "Введите новый пароль";
    if (newPassword.length < PASSWORD_MIN_LENGTH)
      return `Пароль должен быть не менее ${PASSWORD_MIN_LENGTH} символов`;
    if (newPassword !== confirmPassword) return "Пароли не совпадают";
    return null;
  };

  const handleSubmit = async () => {
    if (!user) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (submitGuard.current) return;
    submitGuard.current = true;
    setSubmitting(true);
    setError(null);
    const ok = await onSubmit(user.id, {
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    submitGuard.current = false;
    setSubmitting(false);
    if (ok) onClose();
  };

  return (
    <Modal
      open={open}
      title={`Сменить пароль: ${user?.username ?? ""}`}
      onCancel={onClose}
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
          onClick={handleSubmit}
        >
          Сменить пароль
        </Button>,
      ]}
      destroyOnClose
    >
      <Form layout="vertical" className="mt-4">
        <Form.Item label="Новый пароль">
          <Input.Password
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError(null);
            }}
            placeholder={`Минимум ${PASSWORD_MIN_LENGTH} символов`}
          />
        </Form.Item>
        <Form.Item label="Подтвердить пароль">
          <Input.Password
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError(null);
            }}
            placeholder="Повторите пароль"
          />
        </Form.Item>
        {error && (
          <div style={{ color: "#ff4d4f", marginTop: -8, marginBottom: 12 }}>
            {error}
          </div>
        )}
      </Form>
    </Modal>
  );
};
