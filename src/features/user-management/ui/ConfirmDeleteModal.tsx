import React, { useRef, useState } from "react";
import { Button, Modal } from "antd";
import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { UUID } from "crypto";
import { UserManagementOutDto } from "@/types/api/userManagement";

type ConfirmDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  user: UserManagementOutDto | null;
  onConfirm: (userId: UUID) => Promise<boolean>;
};

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  onClose,
  user,
  onConfirm,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const submitGuard = useRef(false);

  const handleConfirm = async () => {
    if (!user || submitGuard.current) return;
    submitGuard.current = true;
    setSubmitting(true);
    const ok = await onConfirm(user.id);
    submitGuard.current = false;
    setSubmitting(false);
    if (ok) onClose();
  };

  return (
    <Modal
      open={open}
      title="Удалить пользователя"
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
          key="delete"
          type="primary"
          danger
          loading={submitting}
          icon={<DeleteOutlined />}
          onClick={handleConfirm}
        >
          Удалить
        </Button>,
      ]}
      destroyOnClose
    >
      <p>
        Вы уверены, что хотите удалить пользователя{" "}
        <strong>{user?.username}</strong>?
      </p>
      <p style={{ color: "#ff4d4f" }}>
        ⚠️ Действие необратимо без участия разработчика.
      </p>
    </Modal>
  );
};
