import { CloseOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import React from "react";

export type SetPricesBatchPhotosModalProps = {
    open: boolean;
    onClose: () => void;
    onSet: () => void;
    selectedPhotosBatchCount: number;
};

export const SetPricesBatchPhotosModal: React.FC<SetPricesBatchPhotosModalProps> = ({
    open,
    onClose,
    onSet,
    selectedPhotosBatchCount,
}) => {
    const footer = [
        <Button key="back" color="default" variant="outlined" onClick={onClose}>
            <CloseOutlined />Закрыть
        </Button>,
    ]

    return (
        <Modal
            open={open}
            title="Установить фотографии на услуги"
            onCancel={onClose}
            footer={footer}
        >
            <div className="mb-6 flex flex-col gap-2">
                <p>Функционал находится в разработке. Здесь можно будет установить фотографии на услуги</p>
            </div>
        </Modal>
    );
};



