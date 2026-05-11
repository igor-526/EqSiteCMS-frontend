"use client";

import React, { useCallback, useRef } from "react";
import { Button, DatePicker, Select, Tag } from "antd";
import { FileImageOutlined, Html5Outlined, SearchOutlined } from "@ant-design/icons";
import { UUID } from "crypto";
import dayjs from "dayjs";
import { MainTable } from "@/ui";
import { StringFilter } from "@/ui";
import { trimText } from "@/lib";
import { NewsCmsQueryParams, NewsOutDto, NewsStatus } from "@/types/api/news";

const { RangePicker } = DatePicker;

export type NewsTableProps = {
    news: NewsOutDto[];
    loading: boolean;
    filters: NewsCmsQueryParams;
    setFilters: (filters: Partial<NewsCmsQueryParams>) => void;
    filtersElements: React.ReactNode;
    onOpenEditModal: (newsId: UUID) => void;
    onOpenPhotoModal: (newsId: UUID) => void;
    onOpenPageEditorModal: (newsId: string) => void;
};

const getNewsStatus = (item: NewsOutDto): NewsStatus => {
    if (item.is_deleted) return "deleted";
    const now = new Date();
    const publishedAt = new Date(item.published_at);
    return publishedAt <= now ? "published" : "scheduled";
};

const statusConfig: Record<NewsStatus, { label: string; color: string }> = {
    published: { label: "Опубликовано", color: "green" },
    scheduled: { label: "Запланировано", color: "blue" },
    deleted: { label: "Удалено", color: "red" },
};

const STATUS_OPTIONS: { label: string; value: NewsStatus }[] = [
    { label: "Опубликовано", value: "published" },
    { label: "Запланировано", value: "scheduled" },
    { label: "Удалено", value: "deleted" },
];

export const NewsTable: React.FC<NewsTableProps> = ({
    news,
    loading,
    filters,
    setFilters,
    filtersElements,
    onOpenEditModal,
    onOpenPhotoModal,
    onOpenPageEditorModal,
}) => {
    const nameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const snippetDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleNameSearch = useCallback(
        (value: string | undefined) => {
            if (nameDebounceRef.current) clearTimeout(nameDebounceRef.current);
            nameDebounceRef.current = setTimeout(() => {
                setFilters({ name: value || undefined });
            }, 400);
        },
        [setFilters],
    );

    const handleSnippetSearch = useCallback(
        (value: string | undefined) => {
            if (snippetDebounceRef.current) clearTimeout(snippetDebounceRef.current);
            snippetDebounceRef.current = setTimeout(() => {
                setFilters({ snippet: value || undefined });
            }, 400);
        },
        [setFilters],
    );

    const tableData = news.map((item) => ({
        key: item.id.toString(),
        ...item,
    }));

    const columns = [
        {
            title: "Наименование",
            key: "name",
            dataIndex: "name",
            sorter: true,
            render: (name: string) => (
                <span style={{ cursor: "pointer", color: "#1677ff" }}>
                    {trimText(name, 40)}
                </span>
            ),
            filterIcon: (
                <SearchOutlined
                    style={{ color: filters.name ? "#1677ff" : undefined }}
                />
            ),
            filterDropdown: (
                <div style={{ padding: 8 }}>
                    <StringFilter
                        value={filters.name}
                        onChange={handleNameSearch}
                        placeHolder="Поиск по наименованию"
                    />
                </div>
            ),
        },
        {
            title: "Сниппет",
            key: "snippet",
            dataIndex: "snippet",
            render: (snippet: string | null) => (
                <span>{trimText(snippet ?? "", 32)}</span>
            ),
            filterIcon: (
                <SearchOutlined
                    style={{ color: filters.snippet ? "#1677ff" : undefined }}
                />
            ),
            filterDropdown: (
                <div style={{ padding: 8 }}>
                    <StringFilter
                        value={filters.snippet}
                        onChange={handleSnippetSearch}
                        placeHolder="Поиск по сниппету"
                    />
                </div>
            ),
        },
        {
            title: "Дата публикации",
            key: "published_at",
            dataIndex: "published_at",
            sorter: true,
            render: (published_at: string) => {
                if (!published_at) return "-";
                return dayjs(published_at).format("DD.MM.YYYY HH:mm");
            },
            filterIcon: (
                <SearchOutlined
                    style={{
                        color:
                            filters.published_at_from || filters.published_at_to
                                ? "#1677ff"
                                : undefined,
                    }}
                />
            ),
            filterDropdown: (
                <div style={{ padding: 8 }}>
                    <RangePicker
                        showTime
                        value={[
                            filters.published_at_from
                                ? dayjs(filters.published_at_from)
                                : null,
                            filters.published_at_to
                                ? dayjs(filters.published_at_to)
                                : null,
                        ]}
                        onChange={(dates) => {
                            setFilters({
                                published_at_from: dates?.[0]
                                    ? dates[0].toISOString()
                                    : undefined,
                                published_at_to: dates?.[1]
                                    ? dates[1].toISOString()
                                    : undefined,
                            });
                        }}
                    />
                </div>
            ),
        },
        {
            title: "Статус",
            key: "status",
            sorter: true,
            render: (record: NewsOutDto) => {
                const status = getNewsStatus(record);
                const config = statusConfig[status];
                return <Tag color={config.color}>{config.label}</Tag>;
            },
            filterIcon: (
                <SearchOutlined
                    style={{
                        color:
                            filters.status && filters.status.length > 0
                                ? "#1677ff"
                                : undefined,
                    }}
                />
            ),
            filterDropdown: (
                <div style={{ padding: 8, minWidth: 200 }}>
                    <Select
                        mode="multiple"
                        style={{ width: "100%" }}
                        placeholder="Выберите статусы"
                        options={STATUS_OPTIONS}
                        value={filters.status || []}
                        onChange={(values: NewsStatus[]) =>
                            setFilters({ status: values.length > 0 ? values : undefined })
                        }
                        allowClear
                    />
                </div>
            ),
        },
        {
            title: "Действия",
            key: "actions",
            render: (record: NewsOutDto) => (
                <div className="flex gap-2">
                    <Button
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenPhotoModal(record.id);
                        }}
                    >
                        <FileImageOutlined />
                    </Button>
                    <Button
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenPageEditorModal(String(record.id));
                        }}
                    >
                        <Html5Outlined />
                    </Button>
                </div>
            ),
        },
    ];

    const handleSortChange = (sort: string[]) => {
        setFilters({ sort: sort[0] || undefined });
    };

    return (
        <MainTable
            сolumns={columns}
            data={tableData}
            loading={loading}
            filtersElements={filtersElements}
            onSortChange={handleSortChange}
            currentSort={filters.sort ? [filters.sort] : []}
            onRow={(record) => ({
                onClick: () => onOpenEditModal(record.key as UUID),
                style: { cursor: "pointer" },
            })}
        />
    );
};
