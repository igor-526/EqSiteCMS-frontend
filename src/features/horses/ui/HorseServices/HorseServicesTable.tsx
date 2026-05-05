import { getPriceString, trimText } from "@/lib";
import { HorseCoatColorOutDto } from "@/types/api/horseCoatColor";
import { HorseServiceListQueryParams, HorseServiceOutDto } from "@/types/api/horseServices";
import { MainTable, StringFilter } from "@/ui";
import { Html5Outlined, SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { UUID } from "crypto";
import React from "react";

export type HorseServicesTableProps = {
    horseServices: HorseServiceOutDto[];
    loading: boolean;
    filters: HorseServiceListQueryParams;
    setFilters: (filters: HorseServiceListQueryParams) => void;
    filtersElements: React.ReactNode;
    onOpenHorseServiceModal: (horseServiceId: UUID) => void;
    onOpenHorseServicePageModal: (horseServiceId: UUID) => void;
};

export const HorseServicesTable: React.FC<HorseServicesTableProps> = ({
    horseServices,
    loading,
    filters,
    setFilters,
    filtersElements,
    onOpenHorseServiceModal,
    onOpenHorseServicePageModal,
}) => {
    const tableData = horseServices.map((horseService) => ({
        key: horseService.id.toString(),
        ...horseService,
    }));

    const handleSortChange = (sort: string[]) => {
        setFilters({
            ...filters,
            sort: sort as HorseServiceListQueryParams['sort'],
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
                        onChange={(value) => setFilters({ ...filters, name: value ?? undefined })}
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
                        onChange={(value) => setFilters({ ...filters, description: value ?? undefined })}
                        placeHolder="Поиск по описанию" />
                </div>
            </>,
        },
        {
            title: 'Цена',
            key: 'price',
            render: (record: HorseServiceOutDto) => <span>{getPriceString(record.price_formatter, record.price)}</span>,
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
                        onChange={(value) => setFilters({ ...filters, slug: value ?? undefined })}
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
                        onOpenHorseServicePageModal(record.id);
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
                onClick: () => onOpenHorseServiceModal(record.key as UUID),
            })}
        />
    );
};



