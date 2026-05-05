import { PhotoOutDto } from "@/types/api/photos";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import React from "react";

export type ChangePhotoModalProps = {
    open: boolean;
    onClose: () => void;
    onChange: () => void;
    selectedPhoto: PhotoOutDto | null;
};

export const ChangePhotoModal: React.FC<ChangePhotoModalProps> = ({
    open,
    onClose,
    onChange,
    selectedPhoto,
}) => {
    const footer = [
        <Button key="back" color="default" variant="outlined" onClick={onClose}>
            <CloseOutlined />Закрыть
        </Button>,
    ]

    return (
        <Modal
            open={open}
            title="Изменить фотографию"
            onCancel={onClose}
            footer={footer}
        >
            <div className="mb-6 flex flex-col gap-2">
                <p>Функционал находится в разработке. Здесь можно будет изменить параметры фотографии и саму фотографию</p>
            </div>
        </Modal>
    );
};



