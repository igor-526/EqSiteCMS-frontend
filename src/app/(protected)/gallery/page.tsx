"use client";

import React, { useState } from "react";
import { AddPhotosModal } from "@/features/gallery/ui/AddPhotosModal";
import { useGallery } from "@/features/gallery/hooks/useGallery";
import { PhotosList } from "@/features/gallery/ui/PhotosList";
import { PhotoOutDto } from "@/types/api/photos";
import { GalleryFilters } from "@/features/gallery/ui/GalleryFilters";
import { ChangePhotoModal } from "@/features/gallery/ui/ChangePhotoModal";
import { SetHorsesBatchPhotosModal } from "@/features/gallery/ui/SetHorsesBatchPhotosModal";
import { SetPricesBatchPhotosModal } from "@/features/gallery/ui/SetPricesBatchPhotosModal.ts";
import { DeletePhotoBatchModal } from "@/features/gallery/ui/DeletePhotoBatchModal";
import { DeletePhotoModal } from "@/features/gallery/ui/DeletePhotoModal";


export default function GalleryPage() {
    const {
        loadPhotos,
        loadMorePhotos,
        photosList,
        photosLoading,
        photosTotal,
        photosFilters,
        resetFilters,
        setNewFilters,
        deletePhoto,
        deletePhotoBatch,
        uploadPhotosList,
        uploadPhotos,
        removeUploadedPhoto,
        resetPhotosUploadList,
        pricesFilterOptions,
        setPricesFilterSearchValue,
        pricesFilterLoading,
        pricesFilterValues,
        setPricesFilterValues,
        horsesFilterOptions,
        setHorsesFilterSearchValue,
        horsesFilterLoading,
        horsesFilterValues,
        setHorsesFilterValues,
        selectedPhotosBatch,
        setSelectedPhotosBatch,
        selectedPhoto,
        setSelectedPhoto,
        handleSelectAllAction,
    } = useGallery();

    const [openAddPhotosModal, setOpenAddPhotosModal] = useState(false);
    const [openDeletePhotosModal, setOpenDeletePhotosModal] = useState(false);
    const [openDeletePhotosBatchModal, setOpenDeletePhotosBatchModal] = useState(false);
    const [openEditPhotosModal, setOpenEditPhotosModal] = useState(false);
    const [openSetHorsesBatchModal, setOpenSetHorsesBatchModal] = useState(false);
    const [openSetPricesBatchModal, setOpenSetPricesBatchModal] = useState(false);



    const handleOpenAddPhotosModal = () => {
        setOpenAddPhotosModal(true);
    }

    const handleCloseAddPhotosModal = () => {
        setOpenAddPhotosModal(false);
        resetPhotosUploadList();
        loadPhotos();
    }

    const handleOpenDeletePhotoModal = (photo: PhotoOutDto) => {
        setSelectedPhoto(photo);
        setOpenDeletePhotosModal(true);
    }

    const handleOpenDeletePhotosBatchModal = () => {
        setOpenDeletePhotosBatchModal(true);
    }

    const handleOpenEditPhotoModal = (photo: PhotoOutDto) => {
        setSelectedPhoto(photo);
        setOpenEditPhotosModal(true);
    }

    const handleOpenSetHorsesBatchModal = () => {
        setOpenSetHorsesBatchModal(true);
    }

    const handleOpenSetPricesBatchModal = () => {
        setOpenSetPricesBatchModal(true);
    }

    const handleSelectPhoto = (photo: PhotoOutDto, selected: boolean) => {
        setSelectedPhotosBatch(prev => selected ? [...prev, photo] : prev.filter(p => p.id !== photo.id));
    }

    const handleDeletePhotoBatch = async () => {
        const success = await deletePhotoBatch(selectedPhotosBatch);
        if (success) {
            setOpenDeletePhotosBatchModal(false);
            loadPhotos();
        }
    }

    const handleDeletePhoto = () => {
        if (selectedPhoto) {
            deletePhoto(selectedPhoto);
        }
        setOpenDeletePhotosModal(false);
    }


    return (
        <>
            <div className="flex flex-col h-full min-h-0">
                <div className="flex-shrink-0 overflow-visible">
                    <GalleryFilters
                        onOpenAddPhotosModal={handleOpenAddPhotosModal}
                        onOpenSetBatchHorsesModal={handleOpenSetHorsesBatchModal}
                        onOpenSetBatchPricesModal={handleOpenSetPricesBatchModal}
                        onOpenDeletePhotosBatchModal={handleOpenDeletePhotosBatchModal}
                        selectedPhotosBatchCount={selectedPhotosBatch.length}
                        selectAllCheckboxChecked={photosList.length > 0 && selectedPhotosBatch.length === photosList.length}
                        selectAllCheckboxIndeterminate={selectedPhotosBatch.length > 0 && selectedPhotosBatch.length < photosList.length}
                        setSelectAllCheckboxChecked={(checked) => handleSelectAllAction(checked)}
                        pricesFilterOptions={pricesFilterOptions}
                        setPricesFilterSearchValue={setPricesFilterSearchValue}
                        pricesFilterValues={pricesFilterValues}
                        setPricesFilterValues={setPricesFilterValues}
                        pricesFilterLoading={pricesFilterLoading}
                        horsesFilterOptions={horsesFilterOptions}
                        setHorsesFilterSearchValue={setHorsesFilterSearchValue}
                        horsesFilterValues={horsesFilterValues}
                        setHorsesFilterValues={setHorsesFilterValues}
                        horsesFilterLoading={horsesFilterLoading}
                        onResetFilters={resetFilters}
                    />
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <PhotosList
                        photos={photosList}
                        selectedPhotos={selectedPhotosBatch}
                        onSelectPhoto={(photo, selected) => handleSelectPhoto(photo, selected)}
                        onDeletePhoto={(photo) => handleOpenDeletePhotoModal(photo)}
                        onEditPhoto={(photo) => handleOpenEditPhotoModal(photo)}
                        onLoadMore={loadMorePhotos}
                        hasMore={photosList.length < photosTotal}
                        loading={photosLoading}
                    />
                </div>
            </div>
            <AddPhotosModal
                open={openAddPhotosModal}
                onClose={handleCloseAddPhotosModal}
                onAdd={uploadPhotos}
                onRemove={removeUploadedPhoto}
                uploadPhotosList={uploadPhotosList}
            />
            <ChangePhotoModal
                open={openEditPhotosModal}
                onClose={() => setOpenEditPhotosModal(false)}
                onChange={() => console.log('change photo')}
                selectedPhoto={selectedPhoto}
            />
            <SetHorsesBatchPhotosModal
                open={openSetHorsesBatchModal}
                onClose={() => setOpenSetHorsesBatchModal(false)}
                onSet={() => console.log('set horses batch photos')}
                selectedPhotosBatchCount={selectedPhotosBatch.length}
            />
            <SetPricesBatchPhotosModal
                open={openSetPricesBatchModal}
                onClose={() => setOpenSetPricesBatchModal(false)}
                onSet={() => console.log('set prices batch photos')}
                selectedPhotosBatchCount={selectedPhotosBatch.length}
            />
            <DeletePhotoBatchModal
                open={openDeletePhotosBatchModal}
                onClose={() => setOpenDeletePhotosBatchModal(false)}
                onDelete={handleDeletePhotoBatch}
                selectedPhotosBatchCount={selectedPhotosBatch.length}
            />
            <DeletePhotoModal
                open={openDeletePhotosModal}
                onClose={() => setOpenDeletePhotosModal(false)}
                onDelete={handleDeletePhoto}
            />
        </>
    )
}
