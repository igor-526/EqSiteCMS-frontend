import { trimText } from "@/lib";
import { HorseOwnerAvailableSorting, HorseOwnerListQueryParams, HorseOwnerTypeEnum } from "@/types/api/horseOwners";
import { HorseOwnerOutDto } from "@/types/api/horseOwners";
import { ListFilter, MainTable, StringFilter } from "@/ui";
import { SearchOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { UUID } from "crypto";
import React from "react";

const horseOwnerTypesOptions = [
    { key: 'person', label: 'Физ. лицо', value: HorseOwnerTypeEnum.PERSON },
    { key: 'company', label: 'Юр. лицо', value: HorseOwnerTypeEnum.COMPANY },
];

export type HorseOwnersTableProps = {
    horseOwners: HorseOwnerOutDto[];
    loading: boolean;
    filters: HorseOwnerListQueryParams;
    setFilters: (filters: HorseOwnerListQueryParams) => void;
    filtersElements: React.ReactNode;
    onOpenHorseOwnerModal: (horseOwnerId: UUID) => void;
};

export const HorseOwnersTable: React.FC<HorseOwnersTableProps> = ({
    horseOwners,
    loading,
    filters,
    setFilters,
    filtersElements,
    onOpenHorseOwnerModal,
}) => {
    const tableData = horseOwners.map((horseOwner) => ({
        key: horseOwner.id.toString(),
        ...horseOwner,
    }));

    const getTypeTag = (type: HorseOwnerTypeEnum) => {
        switch (type) {
            case HorseOwnerTypeEnum.PERSON:
                return <Tag color="blue">Физ. лицо</Tag>;
            case HorseOwnerTypeEnum.COMPANY:
                return <Tag color="green">Юр. лицо</Tag>;
            default:
                return <Tag color="gray">Неизвестно</Tag>;
        }
    }

    const handleSortChange = (sort: string[]) => {
        setFilters({
            ...filters,
            sort: sort as HorseOwnerAvailableSorting[],
        });
    };

    const columns = [
        {
            title: 'Тип',
            key: 'type',
            dataIndex: 'type',
            sorter: true,
            render: (type: HorseOwnerTypeEnum) => getTypeTag(type),
            filterIcon: <SearchOutlined style={{ color: (Array.isArray(filters.type) && filters.type.length > 0) ? '#1677ff' : undefined }} />,
            filterDropdown: <>
                <div style={{ padding: 8, minWidth: 250, maxWidth: 350 }}>
                    <ListFilter
                        filters={filters}
                        setFilters={(value) => {
                            const newFilters = typeof value === 'function' ? value(filters) : value;
                            setFilters(newFilters);
                        }}
                        filterKey="type"
                        filterData={horseOwnerTypesOptions.map((option) => ({ key: option.key, label: option.label, value: option.value }))}
                        placeHolder="Поиск по типу" />
                </div>
            </>,
        },
        {
            title: 'Наименование|имя',
            key: 'name',
            dataIndex: 'name',
            sorter: true,
            render: (name: string) => <span>{trimText(name, 40)}</span>,
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
            sorter: true,
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
            title: 'Адрес',
            key: 'address',
            dataIndex: 'address',
            render: (address: string | null) => <span>{trimText(address ?? "", 40)}</span>,
            filterIcon: <SearchOutlined style={{ color: filters.address ? '#1677ff' : undefined }} />,
            filterDropdown: <>
                <div style={{ padding: 8 }}>
                    <StringFilter
                        value={filters.address ?? ""}
                        onChange={(value) => setFilters({ ...filters, address: value ?? null })}
                        placeHolder="Поиск по адресу" />
                </div>
            </>,
        },
        {
            title: 'Телефоны',
            key: 'phone_numbers',
            dataIndex: 'phone_numbers',
            render: (phone_numbers: string[]) => <span>{phone_numbers.join('\n')}</span>,
            filterIcon: <SearchOutlined style={{ color: filters.phone_numbers ? '#1677ff' : undefined }} />,
            filterDropdown: <>
                <div style={{ padding: 8 }}>
                    <StringFilter
                        value={filters.phone_numbers ?? ""}
                        onChange={(value) => setFilters({ ...filters, phone_numbers: value ?? null })}
                        placeHolder="Поиск по телефонам" />
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
                onClick: () => onOpenHorseOwnerModal(record.key as UUID),
            })}
        />
    );
};



