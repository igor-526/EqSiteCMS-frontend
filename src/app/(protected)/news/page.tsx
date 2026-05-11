"use client";

import React, { useMemo, useState } from "react";
import { Button, Pagination } from "antd";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { UUID } from "crypto";
import { NewsTabsEnum, NewsTabs } from "@/features/news/ui/NewsTabs";
import { NewsTable } from "@/features/news/ui/NewsTable";
import { NewsModal } from "@/features/news/ui/NewsModal";
import { NewsAdminDocumentationView } from "@/features/news/ui/NewsAdminDocumentationView";
import { NewsDeveloperDocumentationView } from "@/features/news/ui/NewsDeveloperDocumentationView";
import { useNews } from "@/features/news/hooks/useNews";
import { NewsCreateInDto, NewsUpdateInDto } from "@/types/api/news";
import { PhotoSelectorModal } from "@/features/photoSelector/ui/PhotoSelectorModal";
import { usePhotoSelector } from "@/features/photoSelector/hooks/usePhotoSelector";
import { saveNewsPageData, createFetchNewsPageData } from "@/features/pageEditor/services/newsPageDataService";
import { PageEditorModal } from "@/features/pageEditor/ui/PageEditorModal";

export default function NewsPage() {
    const [activeTab, setActiveTab] = useState<NewsTabsEnum>(NewsTabsEnum.NEWS);

    const {
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
    } = useNews();

    const selectedPhotos = useMemo(
        () => news.find((n) => n.id === photoModalNewsId)?.photos ?? [],
        [news, photoModalNewsId],
    );

    const { loadPhotos, loadMorePhotos, photosList, photosLoading, photosTotal } =
        usePhotoSelector(selectedPhotos);

    const handleOpenPhotoModal = (newsId: UUID) => {
        openPhotoModal(newsId);
        loadPhotos();
    };

    const handleCreateNews = async (data: NewsCreateInDto) => {
        const result = await createNews(data);
        if (result) {
            setCreateModalOpen(false);
        }
    };

    const handleUpdateNews = async (newsId: UUID, data: NewsUpdateInDto) => {
        const result = await updateNews(newsId, data);
        if (result) {
            setEditModalOpen(false);
        }
    };

    const handleDeleteNews = async (newsId: UUID) => {
        const result = await softDeleteNews(newsId);
        if (result) {
            setEditModalOpen(false);
        }
    };

    const fetchNewsPageData = useMemo(
        () => createFetchNewsPageData(news),
        [news],
    );

    const filtersElements = (
        <>
            <NewsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex items-center gap-2">
                <Pagination
                    current={filters.page ?? 1}
                    total={newsTotal}
                    pageSize={filters.limit ?? 25}
                    showSizeChanger
                    pageSizeOptions={[10, 25, 50, 100]}
                    onChange={(page, pageSize) => {
                        setFilters({ limit: pageSize });
                        setPage(page);
                    }}
                    onShowSizeChange={(current, size) => {
                        setFilters({ limit: size });
                        setPage(current);
                    }}
                />
                <Button color="danger" variant="outlined" onClick={resetFilters}>
                    <FilterOutlined /> Сбросить
                </Button>
                <Button color="primary" variant="outlined" onClick={openCreateModal}>
                    <PlusOutlined /> Добавить
                </Button>
            </div>
        </>
    );

    return (
        <>
            {activeTab === NewsTabsEnum.NEWS && (
                <>
                    <NewsTable
                        news={news}
                        loading={newsLoading}
                        filters={filters}
                        setFilters={setFilters}
                        filtersElements={filtersElements}
                        onOpenEditModal={openEditModal}
                        onOpenPhotoModal={handleOpenPhotoModal}
                        onOpenPageEditorModal={openPageEditorModal}
                    />

                    {/* Create Modal */}
                    <NewsModal
                        open={createModalOpen}
                        onClose={() => setCreateModalOpen(false)}
                        selectedNews={null}
                        newsList={news}
                        onCreate={handleCreateNews}
                        onUpdate={handleUpdateNews}
                        onDelete={handleDeleteNews}
                        onOpenPhotoModal={handleOpenPhotoModal}
                        validationErrors={validationErrors}
                        onResetValidation={resetValidation}
                    />

                    {/* Edit Modal */}
                    <NewsModal
                        open={editModalOpen}
                        onClose={() => setEditModalOpen(false)}
                        selectedNews={selectedNews}
                        newsList={news}
                        onCreate={handleCreateNews}
                        onUpdate={handleUpdateNews}
                        onDelete={handleDeleteNews}
                        onOpenPhotoModal={handleOpenPhotoModal}
                        validationErrors={validationErrors}
                        onResetValidation={resetValidation}
                    />

                    {/* Photo Selector Modal */}
                    <PhotoSelectorModal
                        open={photoModalOpen}
                        onClose={() => setPhotoModalOpen(false)}
                        selectedPhotos={selectedPhotos}
                        allPhotos={photosList}
                        allPhotosLoading={photosLoading}
                        allPhotosTotal={photosTotal}
                        onUpdate={(updateData) => {
                            if (photoModalNewsId) {
                                updateNewsPhotos(photoModalNewsId, {
                                    photo_ids: updateData.photo_ids as UUID[] | undefined,
                                    main: updateData.main as UUID | undefined | null,
                                });
                            }
                        }}
                        onLoadMorePhotos={loadMorePhotos}
                    />

                    {/* Page Editor Modal (from actions column) */}
                    <PageEditorModal
                        open={pageEditorModalOpen}
                        onClose={() => setPageEditorModalOpen(false)}
                        title={
                            pageEditorNewsId
                                ? `Содержимое: ${news.find((n) => String(n.id) === pageEditorNewsId)?.name ?? ""}`
                                : "Содержимое"
                        }
                        entityId={pageEditorNewsId}
                        fetchPageData={fetchNewsPageData}
                        savePageData={saveNewsPageData}
                    />
                </>
            )}

            {activeTab === NewsTabsEnum.ADMIN_DOCS && (
                <NewsAdminDocumentationView
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            )}

            {activeTab === NewsTabsEnum.DEVELOPER_DOCS && (
                <NewsDeveloperDocumentationView
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            )}
        </>
    );
}
