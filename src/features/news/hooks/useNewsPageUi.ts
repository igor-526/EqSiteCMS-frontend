import { useCallback, useMemo } from "react";
import type { UUID } from "crypto";
import type { PhotoUpdateEntityInDto } from "@/types/api/photos";
import type { NewsOutDto } from "@/types/api/news";

type UseNewsPageUiParams = {
    news: NewsOutDto[];
    photoModalNewsId: UUID | null;
    pageEditorNewsId: string | null;
    setCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPhotoModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPageEditorModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    updateNewsPhotos: (newsId: UUID, updateData: { photo_ids?: UUID[]; main?: UUID | null }) => void;
};

export const useNewsPageUi = ({
    news,
    photoModalNewsId,
    pageEditorNewsId,
    setCreateModalOpen,
    setEditModalOpen,
    setPhotoModalOpen,
    setPageEditorModalOpen,
    updateNewsPhotos,
}: UseNewsPageUiParams) => {
    const selectedPhotos = useMemo(
        () => news.find((item) => item.id === photoModalNewsId)?.photos ?? [],
        [news, photoModalNewsId],
    );

    const pageEditorTitle = useMemo(() => {
        if (!pageEditorNewsId) {
            return "Содержимое";
        }
        const newsItem = news.find((item) => String(item.id) === pageEditorNewsId);
        return `Содержимое: ${newsItem?.name ?? ""}`;
    }, [news, pageEditorNewsId]);

    const handleCreateModalClose = useCallback(() => {
        setCreateModalOpen(false);
    }, [setCreateModalOpen]);

    const handleEditModalClose = useCallback(() => {
        setEditModalOpen(false);
    }, [setEditModalOpen]);

    const handlePhotoModalClose = useCallback(() => {
        setPhotoModalOpen(false);
    }, [setPhotoModalOpen]);

    const handlePageEditorModalClose = useCallback(() => {
        setPageEditorModalOpen(false);
    }, [setPageEditorModalOpen]);

    const handlePhotoUpdate = useCallback(
        (updateData: PhotoUpdateEntityInDto) => {
            if (!photoModalNewsId) {
                return;
            }
            updateNewsPhotos(photoModalNewsId, {
                photo_ids: updateData.photo_ids as UUID[] | undefined,
                main: updateData.main as UUID | null | undefined,
            });
        },
        [photoModalNewsId, updateNewsPhotos],
    );

    return {
        selectedPhotos,
        pageEditorTitle,
        handleCreateModalClose,
        handleEditModalClose,
        handlePhotoModalClose,
        handlePageEditorModalClose,
        handlePhotoUpdate,
    };
};
