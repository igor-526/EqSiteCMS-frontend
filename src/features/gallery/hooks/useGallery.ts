import { useEffect, useState, useCallback } from "react";
import { useNotification } from "@/hooks/useNotification";
import { SelectProps, UploadFile } from "antd";
import { fetchBatchDeletePhotos, fetchCreatePhoto, fetchDeletePhoto, fetchListPhotos } from "../services/galleryService";
import { UUID } from "crypto";
import { PhotoListQueryParams, PhotoOutDto } from "@/types/api/photos";
import { fetchPriceList } from "@/features/prices/services/priceService";

const DEFAULT_PHOTOS_LIMIT = 50;

const DEFAULT_PHOTOS_FILTERS: PhotoListQueryParams = {
    limit: DEFAULT_PHOTOS_LIMIT,
    offset: 0,
};

export const useGallery = () => {
    const toast = useNotification();

    const [photosList, setPhotosList] = useState<PhotoOutDto[]>([]);
    const [photosLoading, setPhotosLoading] = useState(false);
    const [photosTotal, setPhotosTotal] = useState(0);
    const [photosFilters, setPhotosFilters] = useState<PhotoListQueryParams>(DEFAULT_PHOTOS_FILTERS);
    const [uploadPhotosList, setUploadPhotosList] = useState<UploadFile[]>([]);
    const [pricesFilterOptions, setPricesFilterOptions] = useState<SelectProps['options']>([]);
    const [pricesFilterSearchValue, setPricesFilterSearchValue] = useState<string>('');
    const [pricesFilterLoading, setPricesFilterLoading] = useState(false);
    const [pricesFilterValues, setPricesFilterValues] = useState<UUID[]>([]);
    const [horsesFilterOptions, setHorsesFilterOptions] = useState<SelectProps['options']>([]);
    const [horsesFilterSearchValue, setHorsesFilterSearchValue] = useState<string>('');
    const [horsesFilterLoading, setHorsesFilterLoading] = useState(false);
    const [horsesFilterValues, setHorsesFilterValues] = useState<UUID[]>([]);
    const [selectedPhotosBatch, setSelectedPhotosBatch] = useState<PhotoOutDto[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoOutDto | null>(null);

    const loadPhotos = useCallback(async (append: boolean = false, filters?: PhotoListQueryParams) => {
        setPhotosLoading(true);
        const filtersToUse = filters || photosFilters;
        const response = await fetchListPhotos(filtersToUse);
        switch (response.status) {
            case "ok":
                setPhotosList(prev => append ? [...prev, ...response.data?.items || []] : response.data?.items || []);
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
        if (!append) {
            setSelectedPhotosBatch([]);
        }
        setPhotosLoading(false);
    }, [toast, photosFilters]);

    useEffect(() => {
        loadPhotos();
    }, [loadPhotos]);

    const loadPrices = useCallback(async () => {
        setPricesFilterLoading(true);
        const response = await fetchPriceList({
            limit: 20,
            offset: 0,
            name: pricesFilterSearchValue === "" ? null : pricesFilterSearchValue,
            sort: ['name'],
        });
        switch (response.status) {
            case "ok":
                setPricesFilterOptions(response.data?.items.map(item => ({
                    label: item.name,
                    value: item.id,
                })) || []);
                break;
            case "error":
                toast.error({
                    title: "Ошибка",
                    description: response.data?.detail || "Неизвестная ошибка при загрузке цен",
                });
                break;
            default:
                toast.error({
                    title: "Ошибка",
                    description: "Неизвестная ошибка при загрузке цен",
                });
                break;
        }
        setPricesFilterLoading(false);
    }, [toast, pricesFilterSearchValue]);

    useEffect(() => {
        loadPrices();
    }, [loadPrices]);

    const resetPagination = useCallback(() => {
        setPhotosFilters(prev => ({
            ...prev,
            offset: 0,
            limit: DEFAULT_PHOTOS_LIMIT,
        }));
    }, [setPhotosFilters]);

    const setNewFilters = useCallback((filters: Partial<PhotoListQueryParams>) => {
        setPhotosFilters(prev => {
            const newFilters: PhotoListQueryParams = {
                ...prev,
                offset: 0,
                limit: DEFAULT_PHOTOS_LIMIT,
            };
            
            if (filters.name !== undefined) {
                newFilters.name = filters.name;
            } else if ('name' in filters) {
                delete newFilters.name;
            }
            
            if (filters.description !== undefined) {
                newFilters.description = filters.description;
            } else if ('description' in filters) {
                delete newFilters.description;
            }
            
            if (filters.sort !== undefined) {
                newFilters.sort = filters.sort;
            } else if ('sort' in filters) {
                delete newFilters.sort;
            }
            
            if (filters.price_ids !== undefined) {
                newFilters.price_ids = filters.price_ids;
            } else if ('price_ids' in filters) {
                delete newFilters.price_ids;
            }
            
            if (filters.horse_ids !== undefined) {
                newFilters.horse_ids = filters.horse_ids;
            } else if ('horse_ids' in filters) {
                delete newFilters.horse_ids;
            }
            
            loadPhotos(false, newFilters);
            return newFilters;
        });
    }, [setPhotosFilters, loadPhotos]);

    const handlePricesFilterChange = useCallback((values: UUID[]) => {
        setPricesFilterValues(values);
        const priceFilter = values.length > 0 ? values : undefined;
        setNewFilters({
            price_ids: priceFilter,
        });
    }, [setNewFilters]);

    const handleHorsesFilterChange = useCallback((values: UUID[]) => {
        setHorsesFilterValues(values);
        const horseFilter = values.length > 0 ? values : undefined;
        setNewFilters({
            horse_ids: horseFilter,
        });
    }, [setNewFilters]);

    const resetFilters = useCallback(() => {
        setPhotosFilters(DEFAULT_PHOTOS_FILTERS);
        setPricesFilterValues([]);
        setHorsesFilterValues([]);
        resetPagination();
        loadPhotos();
    }, [resetPagination, loadPhotos]);

    const uploadPhotos = useCallback(async (file: File) => {
        const tempFile: UploadFile = {
            uid: `temp-${Date.now()}-${Math.random()}`,
            name: file.name,
            status: 'uploading',
            percent: 0,
        };
        setUploadPhotosList(prev => [...prev, tempFile]);
        const response = await fetchCreatePhoto({
            file,
            name: file.name,
        });
        switch (response.status) {
            case "ok":
                setUploadPhotosList(prev =>
                    prev.map(item =>
                        item.uid === tempFile.uid
                            ? {
                                ...item,
                                uid: response.data!.id,
                                status: 'done',
                                percent: 100,
                                url: response.data!.url,
                            }
                            : item
                    )
                );
                break;
            case "error":
                setUploadPhotosList(prev =>
                    prev.map(item =>
                        item.uid === tempFile.uid
                            ? {
                                ...item,
                                status: 'error',
                            }
                            : item
                    )
                );
                break;
            default:
                setUploadPhotosList(prev =>
                    prev.map(item =>
                        item.uid === tempFile.uid
                            ? {
                                ...item,
                                status: 'error',
                            }
                            : item
                    )
                );
        }
    }, []);

    const deletePhoto = useCallback(async (photo: PhotoOutDto) => {
        const response = await fetchDeletePhoto(photo.id);
        switch (response.status) {
            case "ok":
                loadPhotos();
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
    }, [toast, loadPhotos]);

    const deletePhotoBatch = useCallback(async (photos: PhotoOutDto[]): Promise<boolean> => {
        const response = await fetchBatchDeletePhotos({
            ids: photos.map(photo => photo.id),
        });
        switch (response.status) {
            case "ok":
                return true;
            case "error":
                toast.error({
                    title: "Ошибка",
                    description: response.data?.detail || "Неизвестная ошибка",
                });
                return false;
            default:
                toast.error({
                    title: "Ошибка",
                    description: "Неизвестная ошибка",
                });
                return false;
        }
    }, [toast]);

    const removeUploadedPhoto = useCallback(async (file: UploadFile) => {
        const response = await fetchDeletePhoto(file.uid as UUID);
        switch (response.status) {
            case "ok":
                setUploadPhotosList(prev => prev.filter(item => item.uid !== file.uid));
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
    }, [toast]);

    const resetPhotosUploadList = useCallback(() => {
        setUploadPhotosList([]);
    }, [setUploadPhotosList]);

    const handleSelectAllAction = useCallback((action: boolean) => {
        if (action) {
            setSelectedPhotosBatch(photosList);
        } else {
            setSelectedPhotosBatch([]);
        }
    }, [photosList]);

    const loadMorePhotos = useCallback(async () => {
        if (photosList.length >= photosTotal || photosLoading) {
            return;
        }

        const newOffset = photosList.length;
        const newFilters: PhotoListQueryParams = {
            ...photosFilters,
            offset: newOffset,
        };

        await loadPhotos(true, newFilters);
    }, [photosList.length, photosTotal, photosLoading, photosFilters, loadPhotos]);

    return {
        loadPhotos,
        loadMorePhotos,
        photosList,
        photosLoading,
        photosTotal,
        selectedPhotosBatch,
        setSelectedPhotosBatch,
        selectedPhoto,
        setSelectedPhoto,
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
        setPricesFilterValues: handlePricesFilterChange,
        horsesFilterOptions,
        setHorsesFilterSearchValue,
        horsesFilterLoading,
        horsesFilterValues,
        setHorsesFilterValues: handleHorsesFilterChange,
        handleSelectAllAction,
    };
};

