import { useCallback } from "react";
import type { PhotoOutDto } from "@/types/api/photos";

type UseGalleryPageUiParams = {
    setOpenAddPhotosModal: React.Dispatch<React.SetStateAction<boolean>>;
    setOpenDeletePhotosModal: React.Dispatch<React.SetStateAction<boolean>>;
    setOpenDeletePhotosBatchModal: React.Dispatch<React.SetStateAction<boolean>>;
    setOpenEditPhotosModal: React.Dispatch<React.SetStateAction<boolean>>;
    setOpenSetHorsesBatchModal: React.Dispatch<React.SetStateAction<boolean>>;
    setOpenSetPricesBatchModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useGalleryPageUi = ({
    setOpenAddPhotosModal,
    setOpenDeletePhotosModal,
    setOpenDeletePhotosBatchModal,
    setOpenEditPhotosModal,
    setOpenSetHorsesBatchModal,
    setOpenSetPricesBatchModal,
}: UseGalleryPageUiParams) => {
    const handleEditPhotosModalClose = useCallback(() => {
        setOpenEditPhotosModal(false);
    }, [setOpenEditPhotosModal]);

    const handleSetHorsesBatchModalClose = useCallback(() => {
        setOpenSetHorsesBatchModal(false);
    }, [setOpenSetHorsesBatchModal]);

    const handleSetPricesBatchModalClose = useCallback(() => {
        setOpenSetPricesBatchModal(false);
    }, [setOpenSetPricesBatchModal]);

    const handleDeletePhotosBatchModalClose = useCallback(() => {
        setOpenDeletePhotosBatchModal(false);
    }, [setOpenDeletePhotosBatchModal]);

    const handleDeletePhotosModalClose = useCallback(() => {
        setOpenDeletePhotosModal(false);
    }, [setOpenDeletePhotosModal]);

    const handleSelectPhoto = useCallback(
        (
            photo: PhotoOutDto,
            selected: boolean,
            setSelectedPhotosBatch: React.Dispatch<React.SetStateAction<PhotoOutDto[]>>,
        ) => {
            setSelectedPhotosBatch((previous) =>
                selected
                    ? [...previous, photo]
                    : previous.filter((item) => item.id !== photo.id),
            );
        },
        [],
    );

    return {
        handleEditPhotosModalClose,
        handleSetHorsesBatchModalClose,
        handleSetPricesBatchModalClose,
        handleDeletePhotosBatchModalClose,
        handleDeletePhotosModalClose,
        handleSelectPhoto,
    };
};
