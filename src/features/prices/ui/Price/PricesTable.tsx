import { trimText } from "@/lib";
import { PriceGroupSimpleOutDto } from "@/types/api/priceGroups";
import { PriceListQueryParams } from "@/types/api/prices";
import { PriceOutDto } from "@/types/api/prices";
import { ListFilter, MainTable, StringFilter } from "@/ui";
import { FileImageOutlined, Html5Outlined, SearchOutlined, TableOutlined } from "@ant-design/icons";
import { Button, Tag } from "antd";
import { UUID } from "crypto";
import React from "react";

export type PricesTableProps = {
    prices: PriceOutDto[];
    loading: boolean;
    filters: PriceListQueryParams;
    setFilters: (filters: PriceListQueryParams) => void;
    filtersElements: React.ReactNode;
    onOpenPriceModal: (priceId: UUID) => void;
    priceGroupsOptions: { key: string, label: string, value: UUID }[];
    onOpenPriceTablesModal: (priceId: UUID) => void;
    onOpenPricePhotosModal: (priceId: UUID) => void;
    onOpenPricePageModal: (priceId: UUID) => void;
};

export const PricesTable: React.FC<PricesTableProps> = ({
    prices,
    loading,
    filters,
    setFilters,
    filtersElements,
    onOpenPriceModal,
    priceGroupsOptions,
    onOpenPriceTablesModal,
    onOpenPricePhotosModal,
    onOpenPricePageModal,
}) => {
    const tableData = prices.map((price) => ({
        key: price.id.toString(),
        ...price,
    }));

    const handleSortChange = (sort: string[]) => {
        setFilters({
            ...filters,
            sort: sort as PriceListQueryParams['sort'],
        });
    };

    const columns = [
        {
            title: 'Группы',
            key: 'groups',
            dataIndex: 'groups',
            render: (groups: PriceGroupSimpleOutDto[]) => { return groups.map((group) => <span className="m-1" key={group.id}><Tag color="blue" variant="outlined">{group.name}</Tag></span>) },
            filterIcon: <SearchOutlined style={{ color: (Array.isArray(filters.groups) && filters.groups.length > 0) || (typeof filters.groups === 'string' && filters.groups.length > 0) ? '#1677ff' : undefined }} />,
            filterDropdown: <>
                <div style={{ padding: 8, minWidth: 250, maxWidth: 350 }}>
                    <ListFilter
                        filters={filters}
                        setFilters={(value) => {
                            const newFilters = typeof value === 'function' ? value(filters) : value;
                            setFilters(newFilters);
                        }}
                        filterKey="groups"
                        filterData={priceGroupsOptions.map((option) => ({ key: option.key, label: option.label, value: option.label }))}
                        placeHolder="Поиск по группам услуг" />
                </div>
            </>,
        },
        {
            title: 'Наименование',
            key: 'name',
            dataIndex: 'name',
            sorter: true,
            render: (name: string) => <span>{trimText(name, 40)}</span>,
            filterIcon: <SearchOutlined style={{ color: filters.name ? '#1677ff' : undefined }} />,
            filterDropdown: <>
                <div style={{ padding: 8 }}>
                    <StringFilter
                        value={filters.name as string}
                        onChange={(value) => setFilters({ ...filters, name: value ?? "" })}
                        placeHolder="Поиск по наименованию" />
                </div>
            </>,
        },
        {
            title: 'Описание',
            key: 'description',
            dataIndex: 'description',
            render: (description: string | null) => <span>{trimText(description ?? "", 40)}</span>,
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
            title: 'Путь',
            key: 'slug',
            dataIndex: 'slug',
            render: (slug: string) => <span className="text-blue-900 text-sm">{trimText(slug, 40)}</span>,
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (record: PriceOutDto) => <div className="flex gap-2">
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenPriceTablesModal(record.id);
                    }}>
                    <TableOutlined />
                </Button>
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenPricePhotosModal(record.id);
                    }}>
                    <FileImageOutlined />
                </Button>
                <Button
                    disabled={true}
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenPricePageModal(record.id);
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
            currentSort={filters.sort as string[]}
            onRow={(record) => ({
                onClick: () => onOpenPriceModal(record.key as UUID),
            })}
        />
    );
};



