import React, { useRef, useState } from "react";
import { Button, Modal } from "antd";
import { CloseOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { UUID } from "crypto";
import { UserManagementOutDto } from "@/types/api/userManagement";

type ConfirmBlockModalProps = {
  open: boolean;
  onClose: () => void;
  user: UserManagementOutDto | null;
  onConfirm: (userId: UUID) => Promise<boolean>;
};

export const ConfirmBlockModal: React.FC<ConfirmBlockModalProps> = ({
  open,
  onClose,
  user,
  onConfirm,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const submitGuard = useRef(false);

  const isBlocked = user?.is_blocked ?? false;
  const actionLabel = isBlocked ? "разблокировать" : "заблокировать";

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
      title={`${isBlocked ? "Разблокировать" : "Заблокировать"} пользователя`}
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
          key="confirm"
          type="primary"
          danger={!isBlocked}
          loading={submitting}
          icon={isBlocked ? <UnlockOutlined /> : <LockOutlined />}
          onClick={handleConfirm}
        >
          {isBlocked ? "Разблокировать" : "Заблокировать"}
        </Button>,
      ]}
      destroyOnClose
    >
      <p>
        Вы уверены, что хотите {actionLabel} пользователя{" "}
        <strong>{user?.username}</strong>?
      </p>
      {!isBlocked && (
        <p style={{ color: "#fa8c16" }}>
          Заблокированный пользователь не сможет войти в систему.
        </p>
      )}
    </Modal>
  );
};
