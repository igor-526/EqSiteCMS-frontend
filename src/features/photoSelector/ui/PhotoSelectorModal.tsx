import { PhotoOutShortDto, PhotoUpdateEntityInDto } from "@/types/api/photos";
import {
  CheckOutlined,
  MinusOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Divider, Empty, Modal, Typography, message } from "antd";
import React, { useRef, useState } from "react";
import { PhotoSelectorList } from "./PhotoSelectorList";
import { PhotoElement } from "./PhotoElement";
import { UUID } from "crypto";
import { uploadPhotosToPrice, uploadPhotosToHorse, uploadPhotosToNews } from "@/api/photos";
import { API_STATUS } from "@/lib/apiStatus";

export type EntityType = "price" | "horse" | "news";

export type PhotoSelectorModalProps = {
  open: boolean;
  onClose: () => void;
  selectedPhotos: PhotoOutShortDto[];
  allPhotos: PhotoOutShortDto[];
  allPhotosLoading: boolean;
  allPhotosTotal: number;
  onUpdate: (updateData: PhotoUpdateEntityInDto) => void;
  onLoadMorePhotos: () => void;
  supportsMainPhoto?: boolean;
  entityType: EntityType;
  entityId: UUID | null;
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
  supportsMainPhoto = true,
  entityType,
  entityId,
}) => {
  const { Title } = Typography;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleAddPhoto = (photo: PhotoOutShortDto) => {
    const updateData: PhotoUpdateEntityInDto = {
      photo_ids: [...selectedPhotos.map((p) => p.id), photo.id],
    };
    onUpdate(updateData);
  };

  const handleRemovePhoto = (photo: PhotoOutShortDto) => {
    const updateData: PhotoUpdateEntityInDto = {
      photo_ids: selectedPhotos
        .filter((p) => p.id !== photo.id)
        .map((p) => p.id),
    };
    onUpdate(updateData);
  };

  const handleSetMainPhoto = (photo: PhotoOutShortDto) => {
    if (photo.is_main) {
      return;
    }
    const updateData: PhotoUpdateEntityInDto = {
      photo_ids: selectedPhotos.map((p) => p.id),
      main: photo.id,
    };
    onUpdate(updateData);
  };

  const getUnselectedActions = (photo: PhotoOutShortDto): React.ReactNode[] => {
    return [
      <PlusOutlined
        key={`add-${photo.id}`}
        onClick={() => handleAddPhoto(photo)}
      />,
    ];
  };

  const getSelectedActions = (photo: PhotoOutShortDto): React.ReactNode[] => {
    return [
      <MinusOutlined
        key={`remove-${photo.id}`}
        onClick={() => handleRemovePhoto(photo)}
      />,
      supportsMainPhoto &&
        (photo.is_main ? (
          <StarFilled key={`star-${photo.id}`} style={{ color: "gold" }} />
        ) : (
          <StarOutlined
            key={`star-${photo.id}`}
            onClick={() => handleSetMainPhoto(photo)}
          />
        )),
    ].filter(Boolean) as React.ReactNode[];
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    
    // Convert FileList to File[]
    const filesArray = Array.from(files);
    
    // Reset input value to allow selecting the same files again
    event.target.value = '';
    
    // Upload files
    await uploadFiles(filesArray);
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    if (!entityId) {
      message.error("Не указан идентификатор сущности");
      return;
    }

    setIsUploading(true);

    try {
      // Select the appropriate upload function based on entity type
      let uploadFn;
      switch (entityType) {
        case "price":
          uploadFn = uploadPhotosToPrice;
          break;
        case "horse":
          uploadFn = uploadPhotosToHorse;
          break;
        case "news":
          uploadFn = uploadPhotosToNews;
          break;
        default:
          message.error("Неподдерживаемый тип сущности");
          setIsUploading(false);
          return;
      }

      // Call the upload endpoint
      const response = await uploadFn(entityId, files);

      if (response.status === API_STATUS.OK && response.data) {
        const { photos, errors } = response.data;

        // Handle successful uploads
        if (photos.length > 0) {
          const newPhotoIds = photos.map((p) => p.id);
          const updatedPhotoIds = [
            ...selectedPhotos.map((p) => p.id),
            ...newPhotoIds,
          ];

          // Update the entity with new photo IDs
          onUpdate({ photo_ids: updatedPhotoIds });

          // Show success notification
          if (errors && errors.length > 0) {
            // Partial success
            message.success(
              `Загружено ${photos.length} из ${files.length} фотографий`,
            );
          } else {
            // Full success
            const photoWord =
              photos.length === 1
                ? "фотография"
                : photos.length > 1 && photos.length < 5
                  ? "фотографии"
                  : "фотографий";
            message.success(`Загружено ${photos.length} ${photoWord}`);
          }
        }

        // Handle errors
        if (errors && errors.length > 0) {
          errors.forEach((error) => {
            const fileName = files[error.index]?.name || `файл ${error.index + 1}`;
            message.error(`${fileName}: ${error.message}`);
          });

          // If no photos were uploaded successfully, it's a full failure
          if (photos.length === 0) {
            message.error("Не удалось загрузить ни одной фотографии");
          }
        }
      } else {
        // API error
        const errorMessage =
          response.data && "detail" in response.data
            ? response.data.detail
            : "Ошибка при загрузке фотографий";
        message.error(errorMessage);
      }
    } catch (error) {
      message.error("Неизвестная ошибка при загрузке фотографий");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    // Block concurrent uploads
    if (isUploading) {
      message.warning("Файлы уже загружаются, подождите...");
      return;
    }

    // Extract files from dataTransfer
    const droppedFiles = Array.from(event.dataTransfer.files);

    if (droppedFiles.length === 0) {
      return;
    }

    // Validate file types - only images allowed
    const invalidFiles = droppedFiles.filter(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFiles.length > 0) {
      message.error("Поддерживаются только файлы изображений");
      return;
    }

    // Upload valid files
    await uploadFiles(droppedFiles);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Изменить фотографии"
      centered={true}
      footer={
        <Button key="done" color="primary" variant="outlined" onClick={onClose}>
          <CheckOutlined />
          Готово
        </Button>
      }
      width={{
        xs: "90%",
        sm: "90%",
        md: "90%",
        lg: "90%",
        xl: "90%",
        xxl: "90%",
      }}
      styles={{
        body: {
          maxHeight: "calc(100vh - 150px)",
          overflowY: "auto",
          padding: "24px",
        },
      }}
    >
      <Title level={4}>Выбранные фотографии</Title>
      {selectedPhotos.length > 0 ? (
        <PhotoSelectorList
          hasMore={false}
          loading={false}
          onLoadMore={() => {}}
        >
          {selectedPhotos.map((photo) => (
            <PhotoElement
              key={photo.id}
              photo={photo}
              actions={getSelectedActions(photo)}
            />
          ))}
        </PhotoSelectorList>
      ) : (
        <Empty />
      )}
      <Divider className="my-4" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={4} style={{ margin: 0 }}>Добавить ещё</Title>
        <Button
          icon={<UploadOutlined />}
          onClick={handleUploadClick}
          disabled={isUploading}
          loading={isUploading}
        >
          Загрузить
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragOver ? '2px dashed #1890ff' : '2px dashed transparent',
          backgroundColor: isDragOver ? '#e6f7ff' : 'transparent',
          borderRadius: '8px',
          padding: isDragOver ? '8px' : '0',
          transition: 'all 0.2s ease',
        }}
      >
        {allPhotos.length > 0 ? (
          <PhotoSelectorList
            hasMore={allPhotosTotal > allPhotos.length}
            loading={allPhotosLoading}
            onLoadMore={onLoadMorePhotos}
          >
            {allPhotos.map((photo) => (
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
      </div>
    </Modal>
  );
};
