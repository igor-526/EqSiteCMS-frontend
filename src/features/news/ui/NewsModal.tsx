"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Input, Modal, Popconfirm } from "antd";
import TextArea from "antd/es/input/TextArea";
import {
    CloseOutlined,
    DeleteOutlined,
    EditOutlined,
    FileImageOutlined,
    Html5Outlined,
    PlusOutlined,
} from "@ant-design/icons";
import { UUID } from "crypto";
import dayjs, { Dayjs } from "dayjs";
import { NewsCreateInDto, NewsOutDto, NewsUpdateInDto } from "@/types/api/news";
import { PageEditorModal } from "@/features/pageEditor/ui/PageEditorModal";
import { createFetchNewsPageData, saveNewsPageData } from "@/features/pageEditor/services/newsPageDataService";

export type NewsModalProps = {
    open: boolean;
    onClose: () => void;
    selectedNews: NewsOutDto | null;
    newsList: NewsOutDto[];
    onCreate: (data: NewsCreateInDto) => void;
    onUpdate: (newsId: UUID, data: NewsUpdateInDto) => void;
    onDelete: (newsId: UUID) => void;
    onOpenPhotoModal: (newsId: UUID) => void;
    validationErrors: Record<string, string[]>;
    onResetValidation: () => void;
};

export const NewsModal: React.FC<NewsModalProps> = ({
    open,
    onClose,
    selectedNews,
    newsList,
    onCreate,
    onUpdate,
    onDelete,
    onOpenPhotoModal,
    validationErrors,
    onResetValidation,
}) => {
    const [name, setName] = useState<string>("");
    const [snippet, setSnippet] = useState<string>("");
    const [publishedAt, setPublishedAt] = useState<Dayjs | null>(null);
    const [pageEditorOpen, setPageEditorOpen] = useState<boolean>(false);

    useEffect(() => {
        if (open) {
            if (selectedNews) {
                setName(selectedNews.name);
                setSnippet(selectedNews.snippet ?? "");
                setPublishedAt(selectedNews.published_at ? dayjs(selectedNews.published_at) : null);
            } else {
                setName("");
                setSnippet("");
                setPublishedAt(null);
            }
            onResetValidation();
        }
    }, [open, selectedNews, onResetValidation]);

    const handleInput = useCallback(
        (setter: (value: string) => void, value: string) => {
            if (Object.keys(validationErrors).length > 0) {
                onResetValidation();
            }
            setter(value);
        },
        [validationErrors, onResetValidation],
    );

    const handleCreate = () => {
        if (!publishedAt) return;
        onCreate({
            name,
            snippet: snippet || null,
            content: "",
            published_at: publishedAt.toISOString(),
        });
    };

    const handleUpdate = () => {
        if (!selectedNews) return;
        onUpdate(selectedNews.id, {
            name,
            snippet: snippet || null,
            published_at: publishedAt ? publishedAt.toISOString() : undefined,
        });
    };

    const fetchNewsPageData = useMemo(
        () => createFetchNewsPageData(newsList),
        [newsList],
    );

    const footer = [
        <Button key="close" color="default" variant="outlined" onClick={onClose}>
            <CloseOutlined />
            Закрыть
        </Button>,
    ];

    if (selectedNews) {
        footer.push(
            <Popconfirm
                key="deleteConfirm"
                title="Удалить новость"
                description="Вы уверены, что хотите удалить эту новость? Это действие необратимо."
                okText="Да"
                okType="danger"
                cancelText="Нет"
                onConfirm={() => onDelete(selectedNews.id)}
            >
                <Button key="delete" color="danger" variant="outlined">
                    <DeleteOutlined />
                    Удалить
                </Button>
            </Popconfirm>,
        );
        footer.push(
            <Button key="update" type="primary" onClick={handleUpdate}>
                <EditOutlined />
                Изменить
            </Button>,
        );
    } else {
        footer.push(
            <Button key="create" type="primary" onClick={handleCreate}>
                <PlusOutlined />
                Добавить
            </Button>,
        );
    }

    return (
        <>
            <Modal
                open={open}
                title={selectedNews ? "Изменить новость" : "Добавить новость"}
                onCancel={onClose}
                footer={footer}
            >
                <div className="mb-4 flex flex-col gap-2">
                    <label>Название</label>
                    <Input
                        placeholder="Название новости"
                        value={name}
                        onChange={(e) => handleInput(setName, e.target.value)}
                        maxLength={63}
                        allowClear
                    />
                    {validationErrors.name ? (
                        <div className="text-sm text-red-500">
                            {validationErrors.name.join("\n")}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">{name.length}/63</div>
                    )}
                </div>

                <div className="mb-4 flex flex-col gap-2">
                    <label>Сниппет</label>
                    <TextArea
                        rows={3}
                        placeholder="Краткое описание (необязательно)"
                        value={snippet}
                        onChange={(e) => handleInput(setSnippet, e.target.value)}
                        maxLength={255}
                        allowClear
                    />
                    {validationErrors.snippet ? (
                        <div className="text-sm text-red-500">
                            {validationErrors.snippet.join("\n")}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400">
                            {snippet.length}/255 — Если не заполнено — автогенерируется из содержимого
                        </div>
                    )}
                </div>

                <div className="mb-4 flex flex-col gap-2">
                    <label>Дата публикации</label>
                    <DatePicker
                        showTime
                        value={publishedAt}
                        onChange={(date) => setPublishedAt(date)}
                        style={{ width: "100%" }}
                        placeholder="Выберите дату и время публикации"
                        format="DD.MM.YYYY HH:mm"
                    />
                    {validationErrors.published_at && (
                        <div className="text-sm text-red-500">
                            {validationErrors.published_at.join("\n")}
                        </div>
                    )}
                </div>

                {selectedNews && (
                    <div className="mb-4 flex flex-col gap-2">
                        <label>Содержимое</label>
                        <Button
                            onClick={() => setPageEditorOpen(true)}
                            icon={<Html5Outlined />}
                        >
                            Редактировать HTML
                        </Button>
                    </div>
                )}

                {selectedNews && (
                    <div className="mb-4 flex flex-col gap-2">
                        <label>Фотографии</label>
                        <Button
                            onClick={() => {
                                onClose();
                                onOpenPhotoModal(selectedNews.id);
                            }}
                            icon={<FileImageOutlined />}
                        >
                            Управление фото
                        </Button>
                    </div>
                )}
            </Modal>

            {selectedNews && (
                <PageEditorModal
                    open={pageEditorOpen}
                    onClose={() => setPageEditorOpen(false)}
                    title={`Содержимое: ${selectedNews.name}`}
                    entityId={String(selectedNews.id)}
                    fetchPageData={fetchNewsPageData}
                    savePageData={saveNewsPageData}
                />
            )}
        </>
    );
};
