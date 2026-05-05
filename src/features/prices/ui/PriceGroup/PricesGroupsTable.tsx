import { PriceGroupListQueryParams, PriceGroupOutDto } from "@/types/api/priceGroups";
import { MainTable, StringFilter } from "@/ui";
import { SearchOutlined } from "@ant-design/icons";
import { UUID } from "crypto";
import React from "react";

export type PricesGroupsTableProps = {
    priceGroups: PriceGroupOutDto[];
    loading: boolean;
    filters: PriceGroupListQueryParams;
    setFilters: (filters: PriceGroupListQueryParams) => void;
    filtersElements: React.ReactNode;
    onOpenPriceGroupModal: (priceGroupId: UUID) => void;
};

export const PricesGroupsTable: React.FC<PricesGroupsTableProps> = ({
    priceGroups,
    loading,
    filters,
    setFilters,
    filtersElements,
    onOpenPriceGroupModal,
}) => {
    const tableData = priceGroups.map((priceGroup) => ({
        key: priceGroup.id.toString(),
        ...priceGroup,
    }));

    const handleSortChange = (sort: string[]) => {
        setFilters({
            ...filters,
            sort: sort as PriceGroupListQueryParams['sort'],
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
                onClick: () => onOpenPriceGroupModal(record.key as UUID),
            })}
        />
    );
};



