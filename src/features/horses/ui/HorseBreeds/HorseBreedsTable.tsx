import { trimText } from "@/lib";
import { HorseBreedListQueryParams, HorseBreedOutDto } from "@/types/api/horseBreeds";
import { MainTable, StringFilter } from "@/ui";
import { Html5Outlined, FileImageOutlined, SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { UUID } from "crypto";
import React from "react";

export type HorseBreedsTableProps = {
    horseBreeds: HorseBreedOutDto[];
    loading: boolean;
    filters: HorseBreedListQueryParams;
    setFilters: (filters: HorseBreedListQueryParams) => void;
    filtersElements: React.ReactNode;
    onOpenHorseBreedModal: (horseBreedId: UUID) => void;
    onOpenHorseBreedPhotosModal: (horseBreedId: UUID) => void;
    onOpenHorseBreedPageModal: (horseBreedId: UUID) => void;
};

export const HorseBreedsTable: React.FC<HorseBreedsTableProps> = ({
    horseBreeds,
    loading,
    filters,
    setFilters,
    filtersElements,
    onOpenHorseBreedModal,
    onOpenHorseBreedPhotosModal,
    onOpenHorseBreedPageModal,
}) => {
    const tableData = horseBreeds.map((horseBreed) => ({
        key: horseBreed.id.toString(),
        ...horseBreed,
    }));

    const handleSortChange = (sort: string[]) => {
        setFilters({
            ...filters,
            sort: sort as HorseBreedListQueryParams['sort'],
        });
    };

    const columns = [
        {
            title: 'Наименование',
            key: 'name',
            dataIndex: 'name',
            sorter: true,
            render: (name: string) => <span>{name}</span>,
            filterIcon: <SearchOutlined style={{ color: filters.name ? '#1677ff' : undefined }} />,
            filterDropdown: <>
                <div style={{ padding: 8 }}>
                    <StringFilter
                        value={filters.name ?? ""}
                        onChange={(value) => setFilters({ ...filters, name: value ?? null })}
                        placeHolder="Поиск по наименованию" />
                </div>
            </>,
        },
        {
            title: 'Описание',
            key: 'description',
            dataIndex: 'description',
            render: (description: string | null) => <span>{description}</span>,
            filterIcon: <SearchOutlined style={{ color: filters.description ? '#1677ff' : undefined }} />,
            filterDropdown: <>
                <div style={{ padding: 8 }}>
                    <StringFilter
                        value={filters.description ?? ""}
                        onChange={(value) => setFilters({ ...filters, description: value ?? null })}
                        placeHolder="Поиск по описанию" />
                </div>
            </>,
        },
        {
            title: 'Путь URL',
            key: 'slug',
            dataIndex: 'slug',
            sorter: true,
            render: (slug: string) => <span className="text-blue-900 text-sm">{trimText(slug, 40)}</span>,
            filterIcon: <SearchOutlined style={{ color: filters.slug ? '#1677ff' : undefined }} />,
            filterDropdown: <>
                <div style={{ padding: 8 }}>
                    <StringFilter
                        value={filters.slug ?? ""}
                        onChange={(value) => setFilters({ ...filters, slug: value ?? null })}
                        placeHolder="Поиск по пути URL" />
                </div>
            </>,
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (record: HorseBreedOutDto) => <div className="flex gap-2">
                <Button
                    disabled={true}
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenHorseBreedPhotosModal(record.id);
                    }}>
                    <FileImageOutlined />
                </Button>
                <Button
                    disabled={true}
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenHorseBreedPageModal(record.id);
                    }}>
                    <Html5Outlined />
                </Button>
            </div>,
        },
    ];

    return (
        <MainTable 
            сolumns={columns} 
            data={tableData} 
            loading={loading}
            filtersElements={filtersElements}
            onSortChange={handleSortChange}
            currentSort={filters.sort}
            onRow={(record) => ({
                onClick: () => onOpenHorseBreedModal(record.key as UUID),
            })}
        />
    );
};



