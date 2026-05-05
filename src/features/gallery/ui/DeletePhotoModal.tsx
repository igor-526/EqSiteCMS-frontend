import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import React from "react";

export type DeletePhotoModalProps = {
    open: boolean;
    onClose: () => void;
    onDelete: () => void;
};

export const DeletePhotoModal: React.FC<DeletePhotoModalProps> = ({
    open,
    onClose,
    onDelete,
}) => {
    const footer = [
        <Button key="back" color="default" variant="outlined" onClick={onClose}>
            <CloseOutlined />Закрыть
        </Button>,
        <Button key="delete" color="danger" variant="outlined" onClick={onDelete}>
            <DeleteOutlined />Удалить
        </Button>
    ]

    return (
        <Modal
            open={open}
            title="Удалить фотографию"
            onCancel={onClose}
            footer={footer}
        >
            <div className="mb-6 flex flex-col gap-2">
                <p>Вы уверены, что хотите удалить эту фотографию?</p>
            </div>
        </Modal>
    );
};



