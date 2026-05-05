import { CheckOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Modal, Upload, UploadFile, UploadProps } from "antd";
import React from "react";

export type AddPhotosModalProps = {
    open: boolean;
    onClose: () => void;
    onAdd: (file: File) => void;
    onRemove: (file: UploadFile) => void;
    uploadPhotosList: UploadFile[];
};

export const AddPhotosModal: React.FC<AddPhotosModalProps> = ({
    open,
    onClose,
    onAdd,
    onRemove,
    uploadPhotosList,
}) => {
    const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
        onAdd(file as File);
        return false;
    };

    const handleRemove: UploadProps['onRemove'] = async (file) => {
        onRemove(file);
    };

    return (
        <Modal
            open={open}
            title="Добавить фотографии"
            onCancel={onClose}
            footer={
            <Button key="done" color="primary" variant="outlined" onClick={onClose}>
                <CheckOutlined />Готово
            </Button>
            }
        >
            <Upload
                multiple={true}
                beforeUpload={handleBeforeUpload}
                listType="picture-card"
                fileList={uploadPhotosList}
                onRemove={handleRemove}
                showUploadList={{ showPreviewIcon: false }}
            >
                <button style={{ border: 0, background: 'none' }} type="button">
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                </button>
            </Upload>
        </Modal>
    );
};



