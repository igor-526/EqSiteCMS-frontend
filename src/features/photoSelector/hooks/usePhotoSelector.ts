import { useState, useCallback, useEffect, useRef } from "react";
import { useNotification } from "@/hooks/useNotification";
import { PhotoListQueryParams, PhotoOutDto, PhotoOutShortDto } from "@/types/api/photos";
import { fetchListPhotos } from "@/features/gallery/services/galleryService";

const DEFAULT_PHOTOS_LIMIT = 25;

const DEFAULT_PHOTOS_FILTERS: PhotoListQueryParams = {
    limit: DEFAULT_PHOTOS_LIMIT,
    offset: 0,
};

export const usePhotoSelector = (
    selectedPhotos: PhotoOutShortDto[],
) => {
    const toast = useNotification();

    const [photosList, setPhotosList] = useState<PhotoOutShortDto[]>([]);
    const [photosLoading, setPhotosLoading] = useState(false);
    const [photosTotal, setPhotosTotal] = useState(0);
    const [photosFilters, setPhotosFilters] = useState<PhotoListQueryParams>(DEFAULT_PHOTOS_FILTERS);
    const prevSelectedPhotosIdsRef = useRef<string>('');
    const prevSelectedPhotosRef = useRef<PhotoOutShortDto[]>([]);

    const setNotSelectedPhotos = useCallback((photos: PhotoOutDto[], append: boolean = false) => {
        const notSelectedPhotos = photos.filter(photo => !selectedPhotos.some(selectedPhoto => selectedPhoto.id === photo.id));
        const uniquePhotos = notSelectedPhotos.filter((photo, index, self) => 
            index === self.findIndex(p => p.id === photo.id)
        );
        const shortDtoPhotos = uniquePhotos.map(photo => ({
            id: photo.id,
            url: photo.url,
            is_main: false,
        }));
        setPhotosList(prev => {
            if (append) {
                const uniqueNewPhotos = shortDtoPhotos.filter(
                    newPhoto => !prev.some(existingPhoto => existingPhoto.id === newPhoto.id)
                );
                return [...prev, ...uniqueNewPhotos];
            }
            return shortDtoPhotos;
        });
    }, [selectedPhotos]);

    const loadPhotos = useCallback(async (append: boolean = false) => {
        setPhotosLoading(true);
        if (!append) {
            setPhotosFilters(DEFAULT_PHOTOS_FILTERS);
        }
        const response = await fetchListPhotos(photosFilters);
        switch (response.status) {
            case "ok":
                setNotSelectedPhotos(response.data?.items || [], append);
                setPhotosTotal(response.data?.total || 0);
                break;
            case "error":
                toast.error({
                    title: "Ошибка",
                    description: response.data?.detail || "Неизвестная ошибка",
                });
                break;
            default:
                toast.error({
                    title: "Ошибка",
                    description: "Неизвестная ошибка",
                });
                break;
        }
        setPhotosLoading(false);
    }, [toast, photosFilters, setNotSelectedPhotos]);

    const loadMorePhotos = useCallback(async () => {
        if (photosList.length >= photosTotal || photosLoading) {
            return;
        }

        setPhotosFilters(prev => ({
            ...prev,
            offset: (prev.offset || 0) + DEFAULT_PHOTOS_LIMIT,
        }));
        await loadPhotos(true);
    }, [photosList.length, photosTotal, photosLoading, loadPhotos, setPhotosFilters]);

    useEffect(() => {
        const currentIds = selectedPhotos.map(p => p.id).sort().join(',');
        if (prevSelectedPhotosIdsRef.current === currentIds) {
            return;
        }
        const removedPhotos = prevSelectedPhotosRef.current.filter(
            prevPhoto => !selectedPhotos.some(currentPhoto => currentPhoto.id === prevPhoto.id)
        );

        setPhotosList(prev => {
            let filtered = prev.filter(photo => !selectedPhotos.some(selectedPhoto => selectedPhoto.id === photo.id));
            
            if (removedPhotos.length > 0) {
                const photosToAdd = removedPhotos.filter(
                    removedPhoto => !filtered.some(existingPhoto => existingPhoto.id === removedPhoto.id)
                );
                filtered = [...photosToAdd, ...filtered];
            }

            if (filtered.length !== prev.length || 
                filtered.some((photo, index) => photo.id !== prev[index]?.id)) {
                return filtered;
            }
            return prev;
        });

        prevSelectedPhotosIdsRef.current = currentIds;
        prevSelectedPhotosRef.current = selectedPhotos;
    }, [selectedPhotos]);

    return {
        loadPhotos,
        loadMorePhotos,
        photosList,
        photosLoading,
        photosTotal,
    };
};

