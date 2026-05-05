import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import React from "react";

export type DeletePhotoBatchModalProps = {
    open: boolean;
    onClose: () => void;
    onDelete: () => void;
    selectedPhotosBatchCount: number;
};

export const DeletePhotoBatchModal: React.FC<DeletePhotoBatchModalProps> = ({
    open,
    onClose,
    onDelete,
    selectedPhotosBatchCount,
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
            title="Удалить фотографии"
            onCancel={onClose}
            footer={footer}
        >
            <div className="mb-6 flex flex-col gap-2">
                <p>Вы уверены, что хотите удалить {selectedPhotosBatchCount} фотографий?</p>
            </div>
        </Modal>
    );
};



