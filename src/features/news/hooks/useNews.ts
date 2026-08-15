import { useCallback, useEffect, useState } from "react";
import { API_STATUS, isApiError, isApiSuccess } from "@/lib/apiStatus";
import {
  fetchNewsCmsList,
  fetchNewsCreate,
  fetchNewsDelete,
  fetchNewsPhotosUpdate,
  fetchNewsUpdate,
} from "../services/newsService";
import {
  NewsCmsQueryParams,
  NewsCreateInDto,
  NewsOutDto,
  NewsPhotosUpdateInDto,
  NewsUpdateInDto,
} from "@/types/api/news";
import { useNotification } from "@/hooks/useNotification";
import { zodErrorNormalize } from "@/lib/zodErrorNormalize";
import { newsCreateSchema, newsUpdateSchema } from "../validators/news";
import { UUID } from "crypto";

const DEFAULT_LIMIT = 25;

const defaultFilters: NewsCmsQueryParams = {
  page: 1,
  limit: DEFAULT_LIMIT,
  name: undefined,
  snippet: undefined,
  published_at_from: undefined,
  published_at_to: undefined,
  status: undefined,
  sort: "-published_at",
};

export const useNews = () => {
  const toast = useNotification();

  const [news, setNews] = useState<NewsOutDto[]>([]);
  const [newsTotal, setNewsTotal] = useState<number>(0);
  const [newsLoading, setNewsLoading] = useState<boolean>(false);
  const [filters, setFiltersState] =
    useState<NewsCmsQueryParams>(defaultFilters);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedNews, setSelectedNews] = useState<NewsOutDto | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState<boolean>(false);
  const [photoModalNewsId, setPhotoModalNewsId] = useState<UUID | null>(null);
  const [pageEditorModalOpen, setPageEditorModalOpen] =
    useState<boolean>(false);
  const [pageEditorNewsId, setPageEditorNewsId] = useState<string | null>(null);

  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    const response = await fetchNewsCmsList(filters);
    if (isApiSuccess(response)) {
      setNews(response.data?.items || []);
      setNewsTotal(response.data?.total || 0);
    } else if (isApiError(response)) {
      toast.error({
        title: "Ошибка",
        description: "Не удалось загрузить новости",
      });
    }
    setNewsLoading(false);
  }, [filters, toast]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const setFilters = useCallback((newFilters: Partial<NewsCmsQueryParams>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFiltersState((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  const resetValidation = useCallback(() => {
    setValidationErrors({});
  }, []);

  const createNews = useCallback(
    async (createData: NewsCreateInDto): Promise<boolean> => {
      const validated = newsCreateSchema.safeParse(createData);
      if (!validated.success) {
        setValidationErrors(zodErrorNormalize(validated.error));
        return false;
      }
      const response = await fetchNewsCreate(createData);
      switch (response.status) {
        case API_STATUS.OK:
          toast.success({
            title: "Успешно",
            description: "Новость успешно создана",
          });
          loadNews();
          return true;
        case API_STATUS.ERROR:
          toast.error({
            title: "Ошибка",
            description: response.data?.detail || "Неизвестная ошибка",
          });
          return false;
        default:
          toast.error({ title: "Ошибка", description: "Неизвестная ошибка" });
          return false;
      }
    },
    [toast, loadNews],
  );

  const updateNews = useCallback(
    async (newsId: UUID, updateData: NewsUpdateInDto): Promise<boolean> => {
      const validated = newsUpdateSchema.safeParse(updateData);
      if (!validated.success) {
        setValidationErrors(zodErrorNormalize(validated.error));
        return false;
      }
      const response = await fetchNewsUpdate(newsId, updateData);
      switch (response.status) {
        case API_STATUS.OK:
          toast.success({
            title: "Успешно",
            description: "Новость успешно обновлена",
          });
          loadNews();
          return true;
        case API_STATUS.ERROR:
          toast.error({
            title: "Ошибка",
            description: response.data?.detail || "Неизвестная ошибка",
          });
          return false;
        default:
          toast.error({ title: "Ошибка", description: "Неизвестная ошибка" });
          return false;
      }
    },
    [toast, loadNews],
  );

  const softDeleteNews = useCallback(
    async (newsId: UUID): Promise<boolean> => {
      const response = await fetchNewsDelete(newsId);
      switch (response.status) {
        case API_STATUS.OK:
          toast.success({ title: "Успешно", description: "Новость удалена" });
          loadNews();
          return true;
        case API_STATUS.ERROR:
          toast.error({
            title: "Ошибка",
            description: response.data?.detail || "Неизвестная ошибка",
          });
          return false;
        default:
          toast.error({ title: "Ошибка", description: "Неизвестная ошибка" });
          return false;
      }
    },
    [toast, loadNews],
  );

  const updateNewsPhotos = useCallback(
    async (newsId: UUID, data: NewsPhotosUpdateInDto): Promise<boolean> => {
      const response = await fetchNewsPhotosUpdate(newsId, data);
      switch (response.status) {
        case API_STATUS.OK:
          loadNews();
          return true;
        case API_STATUS.ERROR:
          toast.error({
            title: "Ошибка",
            description: response.data?.detail || "Неизвестная ошибка",
          });
          return false;
        default:
          toast.error({ title: "Ошибка", description: "Неизвестная ошибка" });
          return false;
      }
    },
    [toast, loadNews],
  );

  const openCreateModal = useCallback(() => {
    setSelectedNews(null);
    setCreateModalOpen(true);
  }, []);

  const openEditModal = useCallback(
    (newsId: UUID) => {
      const item = news.find((n) => n.id === newsId) || null;
      setSelectedNews(item);
      setEditModalOpen(true);
    },
    [news],
  );

  const openPhotoModal = useCallback((newsId: UUID) => {
    setPhotoModalNewsId(newsId);
    setPhotoModalOpen(true);
  }, []);

  const openPageEditorModal = useCallback((newsId: string) => {
    setPageEditorNewsId(newsId);
    setPageEditorModalOpen(true);
  }, []);

  return {
    news,
    newsTotal,
    newsLoading,
    filters,
    setFilters,
    setPage,
    resetFilters,
    validationErrors,
    resetValidation,
    createNews,
    updateNews,
    softDeleteNews,
    updateNewsPhotos,
    createModalOpen,
    setCreateModalOpen,
    editModalOpen,
    setEditModalOpen,
    selectedNews,
    setSelectedNews,
    photoModalOpen,
    setPhotoModalOpen,
    photoModalNewsId,
    pageEditorModalOpen,
    setPageEditorModalOpen,
    pageEditorNewsId,
    openCreateModal,
    openEditModal,
    openPhotoModal,
    openPageEditorModal,
    loadNews,
  };
};
