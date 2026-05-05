import { SiteSettingAvailableSorting, SiteSettingListQueryParams, SiteSettingOutDto, SiteSettingType } from "@/types/api/siteSettings";
import { ListFilter, MainTable, StringFilter } from "@/ui";
import { UUID } from "crypto";
import React, { useState, useEffect } from "react";
import { SiteSettingsHeader } from "./SiteSettingsHeader";
import { SearchOutlined } from "@ant-design/icons";
import { trimText } from "@/lib";
import { Tag } from "antd";

const siteSettingTypesOptions = [
    { key: 'string', label: 'Строка', value: SiteSettingType.string },
    { key: 'number', label: 'Число', value: SiteSettingType.number },
    { key: 'float', label: 'Число с плавающей точкой', value: SiteSettingType.float },
    { key: 'boolean', label: 'Булево', value: SiteSettingType.boolean },
    { key: 'object', label: 'Объект', value: SiteSettingType.object },
    { key: 'date', label: 'Дата', value: SiteSettingType.date },
    { key: 'time', label: 'Время', value: SiteSettingType.time },
    { key: 'datetime', label: 'Дата и время', value: SiteSettingType.datetime },
];

const getSettingTypeTag = (type: SiteSettingType) => {
    switch (type) {
        case SiteSettingType.string:
            return <Tag color="blue" variant="outlined">Строка</Tag>;
        case SiteSettingType.number:
            return <Tag color="green" variant="outlined">Число</Tag>;
        case SiteSettingType.float:
            return <Tag color="green" variant="outlined">Число с плавающей точкой</Tag>;
        case SiteSettingType.boolean:
            return <Tag color="red" variant="outlined">Булево</Tag>;
        case SiteSettingType.object:
            return <Tag color="purple" variant="outlined">Объект</Tag>;
        case SiteSettingType.date:
            return <Tag color="cyan" variant="outlined">Дата</Tag>;
        case SiteSettingType.time:
            return <Tag color="cyan" variant="outlined">Время</Tag>;
        case SiteSettingType.datetime:
            return <Tag color="cyan" variant="outlined">Дата и время</Tag>;
        default:
            return <Tag color="gray" variant="outlined">Неизвестный тип</Tag>;
    }
};

export type SiteSettingsTableProps = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    siteSettings: SiteSettingOutDto[];
    siteSettingsTotal: number;
    loading: boolean;
    filters: SiteSettingListQueryParams;
    setFilters: (filters: SiteSettingListQueryParams) => void;
    onOpenSiteSettingModal: (siteSettingId: UUID | null) => void;
    onResetSiteSettingFilters: () => void;
};

export const SiteSettingsTable: React.FC<SiteSettingsTableProps> = ({
    activeTab,
    setActiveTab,
    siteSettings,
    siteSettingsTotal,
    loading,
    filters,
    setFilters,
    onOpenSiteSettingModal,
    onResetSiteSettingFilters,
}) => {
    const [frontendSort, setFrontendSort] = useState<string[]>([]);
    useEffect(() => {
        setFrontendSort(convertApiSortToFrontendSort(filters.sort as string[]));
    }, [filters.sort]);

    const convertApiSortToFrontendSort = (sort: string[]): string[] => {
        return sort.map((s) => {
            switch (s) {
                case 'key':
                    return 'dataKey';
                case '-key':
                    return '-dataKey';
                default:
                    return s;
            }
        });
    };

    const tableData = siteSettings.map((siteSetting) => {
        const { key, ...rest } = siteSetting;
        return {
            key: siteSetting.id.toString(),
            dataKey: key,
            ...rest,
        };
    });

    const handleSortChange = (sort: string[]) => {
        const newSort = sort.map((s) => {
            switch (s) {
                case 'dataKey':
                    return 'key';
                case '-dataKey':
                    return '-key';
                default:
                    return s;
            }
        });
        setFilters({
            ...filters,
            sort: newSort as SiteSettingAvailableSorting[],
        });
    };

    const columns = [
        {
            title: 'Key',
            key: 'dataKey',
            dataIndex: 'dataKey',
            sorter: true,
            render: (dataKey: string) => <span className="text-gray-600 font-bold">{trimText(dataKey, 40)}</span>,
            filterIcon: <SearchOutlined style={{ color: filters.key ? '#1677ff' : undefined }} />,
            filterDropdown: <>
                <div style={{ padding: 8 }}>
                    <StringFilter
                        value={filters.key as string}
                        onChange={(value) => setFilters({ ...filters, key: value !== "" ? value : undefined })}
                        placeHolder="Поиск по ключу" />
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
                        onChange={(value) => setFilters({ ...filters, name: value !== "" ? value : undefined })}
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
                        value={filters.description as string}
                        onChange={(value) => setFilters({ ...filters, description: value !== "" ? value : undefined })}
                        placeHolder="Поиск по описанию" />
                </div>
            </>,
        },
        {
            title: 'Тип',
            key: 'type',
            dataIndex: 'type',
            sorter: true,
            render: (type: SiteSettingType) => getSettingTypeTag(type),
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
                        filterData={siteSettingTypesOptions}
                        placeHolder="Поиск по типу" />
                </div>
            </>,
        },
        {
            title: 'Значение',
            key: 'value',
            dataIndex: 'value',
            render: (value: string) => <span>{trimText(value, 40)}</span>,
        },
    ];

    const filtersElements = (
        <>
            <SiteSettingsHeader
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onCreateSiteSetting={() => onOpenSiteSettingModal(null)}
                resetSiteSettingFilters={() => onResetSiteSettingFilters()}
                siteSettingTotal={siteSettingsTotal}
                siteSettingFilters={filters}
                setSiteSettingFilters={setFilters}
            />
        </>
    );

    return (
        <MainTable
            сolumns={columns}
            data={tableData}
            loading={loading}
            filtersElements={filtersElements}
            onSortChange={handleSortChange}
            currentSort={frontendSort}
            onRow={(record) => ({
                onClick: () => onOpenSiteSettingModal(record.key as UUID),
            })}
        />
    );
};



