import { trimText } from "@/lib";
import { HorseCoatColorListQueryParams, HorseCoatColorOutDto } from "@/types/api/horseCoatColor";
import { MainTable, StringFilter } from "@/ui";
import { Html5Outlined, SearchOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { UUID } from "crypto";
import React from "react";
import { HORSES_PAGE_SCOPES_ACTIONS, useHorsePageActionScopes } from "../../hooks/useHorseScopes";

const FILTER_ACTIVE_COLOR = "#1677ff";
const SLUG_MAX_LENGTH = 40;

export type HorseCoatColorsTableProps = {
    horseCoatColors: HorseCoatColorOutDto[];
    loading: boolean;
    filters: HorseCoatColorListQueryParams;
    setFilters: (filters: HorseCoatColorListQueryParams) => void;
    filtersElements: React.ReactNode;
    onOpenHorseCoatColorModal: (horseCoatColorId: UUID) => void;
    onOpenHorseCoatColorPageModal: (horseCoatColorId: UUID) => void;
};

export const HorseCoatColorsTable: React.FC<HorseCoatColorsTableProps> = ({
    horseCoatColors,
    loading,
    filters,
    setFilters,
    filtersElements,
    onOpenHorseCoatColorModal,
    onOpenHorseCoatColorPageModal,
}) => {
    const { hasPermission } = useHorsePageActionScopes();
    const canUpdateDictionary = hasPermission(HORSES_PAGE_SCOPES_ACTIONS.UPDATE_HORSE_DICTIONARY);
    const tableData = horseCoatColors.map((horseCoatColor) => ({
        key: horseCoatColor.id.toString(),
        ...horseCoatColor,
    }));

    const handleSortChange = (sort: string[]) => {
        setFilters({
            ...filters,
            sort: sort as HorseCoatColorListQueryParams['sort'],
            offset: 0,
        });
    };

    const getFilterIconColor = (value: unknown): string | undefined =>
        (Array.isArray(value) ? value.length > 0 : Boolean(value))
            ? FILTER_ACTIVE_COLOR
            : undefined;

    const handleNameChange = (value: string | undefined) => {
        setFilters({ ...filters, name: value || undefined, offset: 0 });
    };

    const handleShortNameChange = (value: string | undefined) => {
        setFilters({ ...filters, short_name: value || undefined, offset: 0 });
    };

    const handleDescriptionChange = (value: string | undefined) => {
        setFilters({ ...filters, description: value || undefined, offset: 0 });
    };

    const handleSlugChange = (value: string | undefined) => {
        setFilters({ ...filters, slug: value || undefined, offset: 0 });
    };

    const columns = [
        {
            title: 'Наименование',
            key: 'name',
            dataIndex: 'name',
            sorter: true,
            render: (name: string) => <span>{name}</span>,
            filterIcon: <SearchOutlined style={{ color: getFilterIconColor(filters.name) }} />,
            filterDropdown: <>
                <div style={{ padding: 8 }}>
                    <StringFilter
                        value={filters.name ?? ""}
                        onChange={handleNameChange}
                        placeHolder="Поиск по наименованию" />
                </div>
            </>,
        },
        {
            title: 'Кор. наим.',
            key: 'short_name',
            dataIndex: 'short_name',
            sorter: true,
            render: (shortName: string) => <span>{shortName}</span>,
            filterIcon: <SearchOutlined style={{ color: getFilterIconColor(filters.short_name) }} />,
            filterDropdown: <div style={{ padding: 8 }}>
                <StringFilter
                    value={filters.short_name ?? ""}
                    onChange={handleShortNameChange}
                    placeHolder="Поиск по короткому наименованию" />
            </div>,
        },
        {
            title: 'Описание',
            key: 'description',
            dataIndex: 'description',
            render: (description: string | null) => <span>{description}</span>,
            filterIcon: <SearchOutlined style={{ color: getFilterIconColor(filters.description) }} />,
            filterDropdown: <>
                <div style={{ padding: 8 }}>
                    <StringFilter
                        value={filters.description ?? ""}
                        onChange={handleDescriptionChange}
                        placeHolder="Поиск по описанию" />
                </div>
            </>,
        },
        {
            title: 'Путь URL',
            key: 'slug',
            dataIndex: 'slug',
            sorter: true,
            render: (slug: string) => <span className="text-blue-900 text-sm">{trimText(slug, SLUG_MAX_LENGTH)}</span>,
            filterIcon: <SearchOutlined style={{ color: getFilterIconColor(filters.slug) }} />,
            filterDropdown: <>
                <div style={{ padding: 8 }}>
                    <StringFilter
                        value={filters.slug ?? ""}
                        onChange={handleSlugChange}
                        placeHolder="Поиск по пути URL" />
                </div>
            </>,
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (record: HorseCoatColorOutDto) => {
                const handlePageModalClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    onOpenHorseCoatColorPageModal(record.id);
                };
                return (
                    <div className="flex gap-2">
                        <Button onClick={handlePageModalClick}>
                            <Html5Outlined />
                        </Button>
                    </div>
                );
            },
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
                onClick: () => {
                    if (canUpdateDictionary) onOpenHorseCoatColorModal(record.key as UUID);
                },
            })}
        />
    );
};

