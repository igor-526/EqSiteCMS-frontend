import { PhotoOutShortDto, PhotoUpdateEntityInDto } from "@/types/api/photos";
import { CheckOutlined, MinusOutlined, PlusOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import { Button, Divider, Empty, Modal, Typography } from "antd";
import React from "react";
import { PhotoSelectorList } from "./PhotoSelectorList";
import { PhotoElement } from "./PhotoElement";

export type PhotoSelectorModalProps = {
    open: boolean;
    onClose: () => void;
    selectedPhotos: PhotoOutShortDto[]
    allPhotos: PhotoOutShortDto[]
    allPhotosLoading: boolean
    allPhotosTotal: number
    onUpdate: (updateData: PhotoUpdateEntityInDto) => void
    onLoadMorePhotos: () => void
};

export const PhotoSelectorModal: React.FC<PhotoSelectorModalProps> = ({
    open,
    onClose,
    selectedPhotos,
    allPhotos,
    allPhotosLoading,
    allPhotosTotal,
    onUpdate,
    onLoadMorePhotos,
}) => {
    const { Title } = Typography;

    const handleAddPhoto = (photo: PhotoOutShortDto) => {
        const updateData: PhotoUpdateEntityInDto = {
            photo_ids: [...selectedPhotos.map(p => p.id), photo.id],
        };
        onUpdate(updateData);
    };

    const handleRemovePhoto = (photo: PhotoOutShortDto) => {
        const updateData: PhotoUpdateEntityInDto = {
            photo_ids: selectedPhotos.filter(p => p.id !== photo.id).map(p => p.id),
        };
        onUpdate(updateData);
    };

    const handleSetMainPhoto = (photo: PhotoOutShortDto) => {
        if (photo.is_main) {
            return;
        }
        const updateData: PhotoUpdateEntityInDto = {
            main: photo.id,
        };
        onUpdate(updateData);
    };

    const getUnselectedActions = (photo: PhotoOutShortDto): React.ReactNode[] => {
        return [
            <PlusOutlined key={`add-${photo.id}`} onClick={() => handleAddPhoto(photo)} />,
        ];
    }

    const getSelectedActions = (photo: PhotoOutShortDto): React.ReactNode[] => {
        return [
            <MinusOutlined key={`remove-${photo.id}`} onClick={() => handleRemovePhoto(photo)} />,
            photo.is_main ? (
                <StarFilled key={`star-${photo.id}`} style={{ color: 'gold' }} />
            ) : (
                <StarOutlined key={`star-${photo.id}`} onClick={() => handleSetMainPhoto(photo)} />
            ),
        ];
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title="Изменить фотографии"
            centered={true}
            footer={
                <Button key="done" color="primary" variant="outlined" onClick={onClose}>
                    <CheckOutlined />Готово
                </Button>
            }
            width={{
                xs: '90%',
                sm: '90%',
                md: '90%',
                lg: '90%',
                xl: '90%',
                xxl: '90%',
            }}
            styles={{
                body: {
                    maxHeight: 'calc(100vh - 150px)',
                    overflowY: 'auto',
                    padding: '24px',
                }
            }}
        >
            <Title level={4}>Выбранные фотографии</Title>
            {selectedPhotos.length > 0 ? (
                <PhotoSelectorList
                    hasMore={false}
                    loading={false}
                    onLoadMore={() => { }}>
                    {selectedPhotos.map(photo => (
                        <PhotoElement key={photo.id} photo={photo} actions={getSelectedActions(photo)} />
                    ))}
                </PhotoSelectorList>
            ) : (
                <Empty />
            )}
            <Divider className="my-4" />
            <Title level={4}>Добавить ещё</Title>
            {allPhotos.length > 0 ? (
            <PhotoSelectorList
                hasMore={allPhotosTotal > allPhotos.length}
                loading={allPhotosLoading}
                onLoadMore={onLoadMorePhotos}>
                {allPhotos.map(photo => (
                    <PhotoElement
                        key={photo.id}
                        photo={photo}
                        actions={getUnselectedActions(photo)}
                    />
                ))}
            </PhotoSelectorList>
            ) : (
                <Empty />
            )}
        </Modal>
    );
};



