import { trimText } from "@/lib";
import { HorseCoatColorListQueryParams, HorseCoatColorOutDto } from "@/types/api/horseCoatColor";
import { MainTable, StringFilter } from "@/ui";
import { FileImageOutlined, Html5Outlined, SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { UUID } from "crypto";
import React from "react";

export type HorseCoatColorsTableProps = {
    horseCoatColors: HorseCoatColorOutDto[];
    loading: boolean;
    filters: HorseCoatColorListQueryParams;
    setFilters: (filters: HorseCoatColorListQueryParams) => void;
    filtersElements: React.ReactNode;
    onOpenHorseCoatColorModal: (horseCoatColorId: UUID) => void;
    onOpenHorseCoatColorPhotosModal: (horseCoatColorId: UUID) => void;
    onOpenHorseCoatColorPageModal: (horseCoatColorId: UUID) => void;
};

export const HorseCoatColorsTable: React.FC<HorseCoatColorsTableProps> = ({
    horseCoatColors,
    loading,
    filters,
    setFilters,
    filtersElements,
    onOpenHorseCoatColorModal,
    onOpenHorseCoatColorPhotosModal,
    onOpenHorseCoatColorPageModal,
}) => {
    const tableData = horseCoatColors.map((horseCoatColor) => ({
        key: horseCoatColor.id.toString(),
        ...horseCoatColor,
    }));

    const handleSortChange = (sort: string[]) => {
        setFilters({
            ...filters,
            sort: sort as HorseCoatColorListQueryParams['sort'],
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
            render: (record: HorseCoatColorOutDto) => <div className="flex gap-2">
                <Button
                    disabled={true}
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenHorseCoatColorPhotosModal(record.id);
                    }}>
                    <FileImageOutlined />
                </Button>
                <Button
                    disabled={true}
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenHorseCoatColorPageModal(record.id);
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
                onClick: () => onOpenHorseCoatColorModal(record.key as UUID),
            })}
        />
    );
};



