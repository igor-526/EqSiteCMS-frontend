import { Button, Modal, Typography } from "antd";
import React from "react";

export type HorsePedigreeModalProps = {
    open: boolean;
    onClose: () => void;
};

export const HorsePedigreeModal: React.FC<HorsePedigreeModalProps> = ({ open, onClose }) => {
    return (
        <Modal
            open={open}
            title="Родословная"
            onCancel={onClose}
            footer={
                <Button key="close" onClick={onClose}>
                    Закрыть
                </Button>
            }
        >
            <Typography.Text>Функционал в разработке</Typography.Text>
        </Modal>
    );
};
