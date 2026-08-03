import { trimText } from "@/lib";
import {
    HorseListQueryParams,
    HorseOutDto,
    HorsePedigreeDto,
    HorseWithPedigreeOutDto,
} from "@/types/api/horses";
import { ListFilter, MainTable, StringFilter } from "@/ui";
import { BranchesOutlined, DollarOutlined, FileImageOutlined, SearchOutlined } from "@ant-design/icons";
import { Alert, Badge, Button, Tooltip } from "antd";
import { UUID } from "crypto";
import React from "react";

const SEX_LABELS: Record<string, string> = {
    male: "Жеребец",
    female: "Кобыла",
    geld: "Мерин",
};

const SEX_OPTIONS = [
    { key: "male", label: "Жеребец", value: "Жеребец" },
    { key: "female", label: "Кобыла", value: "Кобыла" },
    { key: "geld", label: "Мерин", value: "Мерин" },
];

const BREED_OPTIONS_PLACEHOLDER = "Выберите породу";
const COAT_COLOR_OPTIONS_PLACEHOLDER = "Выберите масть";

const GrayCountBadge: React.FC<{ count: number; children: React.ReactNode }> = ({ count, children }) => (
    <Badge count={count} showZero size="small" overflowCount={99} color="#8c8c8c">
        {children}
    </Badge>
);

export type HorsesTableProps = {
    horses: (HorseOutDto | HorseWithPedigreeOutDto)[];
    loading: boolean;
    error?: string | null;
    filters: HorseListQueryParams;
    setFilters: (filters: HorseListQueryParams) => void;
    filtersElements: React.ReactNode;
    onOpenHorseModal: (horseId: UUID) => void;
    onPhotosClick: (horseId: UUID) => void;
    onPedigreeClick: (horseId: UUID) => void;
    onServicesClick: (horseId: UUID) => void;
    breedOptions: { label: string; value: string }[];
    coatColorOptions: { label: string; value: string }[];
    ownerOptions: { label: string; value: string }[];
};

function isPedigreeHorse(
    horse: HorseOutDto | HorseWithPedigreeOutDto,
): horse is HorseWithPedigreeOutDto {
    return "pedigree" in horse && horse.pedigree !== undefined;
}

function getPedigree(horse: HorseOutDto | HorseWithPedigreeOutDto): HorsePedigreeDto | null {
    if (isPedigreeHorse(horse)) {
        return horse.pedigree;
    }
    return null;
}

function buildPedigreeTooltip(pedigree: HorsePedigreeDto | null): React.ReactNode {
    if (!pedigree) return null;
    const { sire, dam, foals = [] } = pedigree;
    if (!sire && !dam && foals.length === 0) return null;

    const foalsText =
        foals.length <= 2 ? foals.map((f) => f.name).join(", ") : String(foals.length);

    return (
        <div>
            <div>Отец: {sire?.name ?? "—"}</div>
            <div>Мать: {dam?.name ?? "—"}</div>
            <div>Потомство: {foals.length > 0 ? foalsText : "—"}</div>
        </div>
    );
}

const PedigreeIndicator: React.FC<{
    horse: HorseOutDto | HorseWithPedigreeOutDto;
    onClick: () => void;
}> = ({ horse, onClick }) => {
    const pedigree = getPedigree(horse);
    const hasSire = Boolean(pedigree?.sire);
    const hasDam = Boolean(pedigree?.dam);
    const hasFoals = (pedigree?.foals?.length ?? 0) > 0;
    const hasAny = hasSire || hasDam || hasFoals;

    const tooltipContent = buildPedigreeTooltip(pedigree);

    const btn = (
        <Button
            size="small"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            <BranchesOutlined />
            <span style={{ display: "inline-flex", gap: 2, marginLeft: 4 }}>
                <span
                    style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: hasSire ? "#1677ff" : "#d9d9d9",
                    }}
                />
                <span
                    style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: hasDam ? "#eb2f96" : "#d9d9d9",
                    }}
                />
                <span
                    style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: hasFoals ? "#52c41a" : "#d9d9d9",
                    }}
                />
            </span>
        </Button>
    );

    if (hasAny && tooltipContent) {
        return <Tooltip title={tooltipContent}>{btn}</Tooltip>;
    }
    return btn;
};

export const HorsesTable: React.FC<HorsesTableProps> = ({
    horses,
    loading,
    error = null,
    filters,
    setFilters,
    filtersElements,
    onOpenHorseModal,
    onPhotosClick,
    onPedigreeClick,
    onServicesClick,
    breedOptions,
    coatColorOptions,
    ownerOptions = [],
}) => {
    const tableData = horses.map((horse) => ({
        key: horse.id.toString(),
        ...horse,
    }));

    const handleSortChange = (sort: string[]) => {
        setFilters({
            ...filters,
            sort: sort as HorseListQueryParams["sort"],
            offset: 0,
        });
    };

    const columns = [
        {
            title: "База",
            key: "this_stable",
            dataIndex: "this_stable",
            fixed: "left" as const,
            width: 70,
            render: (val: boolean) => <span>{val ? "Да" : "Нет"}</span>,
            filterIcon: (
                <SearchOutlined
                    className={
                        filters.this_stable !== undefined && filters.this_stable !== null
                            ? "text-blue-600"
                            : undefined
                    }
                />
            ),
            filterDropdown: (
                <div style={{ padding: 8, minWidth: 150 }}>
                    <ListFilter
                        filters={filters}
                        setFilters={(value) => {
                            const newFilters =
                                typeof value === "function" ? value(filters) : value;
                            setFilters({ ...newFilters, offset: 0 });
                        }}
                        filterKey="this_stable"
                        filterData={[
                            { key: "true", label: "Наши", value: "true" },
                            { key: "false", label: "Чужие", value: "false" },
                        ]}
                        placeHolder="База"
                    />
                </div>
            ),
        },
        {
            title: "Кличка",
            key: "name",
            dataIndex: "name",
            fixed: "left" as const,
            width: 160,
            sorter: true,
            render: (name: string) => <span>{trimText(name, 32)}</span>,
            filterIcon: (
                <SearchOutlined style={{ color: filters.name ? "#1677ff" : undefined }} />
            ),
            filterDropdown: (
                <div style={{ padding: 8 }}>
                    <StringFilter
                        value={filters.name ?? ""}
                        onChange={(value) =>
                            setFilters({ ...filters, name: value ?? undefined, offset: 0 })
                        }
                        placeHolder="Поиск по кличке"
                    />
                </div>
            ),
        },
        {
            title: "Код",
            key: "code",
            dataIndex: "code",
            width: 160,
            render: (code: string | null) => <span>{code === null ? "—" : code}</span>,
        },
        {
            title: "Описание",
            key: "description",
            dataIndex: "description",
            width: 180,
            render: (description: string | null) => (
                <span>{trimText(description ?? "", 32)}</span>
            ),
            filterIcon: (
                <SearchOutlined
                    style={{ color: filters.description ? "#1677ff" : undefined }}
                />
            ),
            filterDropdown: (
                <div style={{ padding: 8 }}>
                    <StringFilter
                        value={filters.description ?? ""}
                        onChange={(value) =>
                            setFilters({
                                ...filters,
                                description: value ?? undefined,
                                offset: 0,
                            })
                        }
                        placeHolder="Поиск по описанию"
                    />
                </div>
            ),
        },
        {
            title: "Порода",
            key: "breed_name",
            width: 150,
            sorter: true,
            render: (record: HorseOutDto) => {
                const breed = record.breed;
                if (!breed) return <span>—</span>;
                const name = breed.short_name ?? breed.name;
                return <span>{trimText(name, 32)}</span>;
            },
            filterIcon: (
                <SearchOutlined
                    style={{
                        color:
                            Array.isArray(filters.breed_ids) && filters.breed_ids.length > 0
                                ? "#1677ff"
                                : undefined,
                    }}
                />
            ),
            filterDropdown: (
                <div style={{ padding: 8, minWidth: 250 }}>
                    <ListFilter
                        filters={filters}
                        setFilters={(value) => {
                            const newFilters =
                                typeof value === "function" ? value(filters) : value;
                            setFilters({ ...newFilters, offset: 0 });
                        }}
                        filterKey="breed_ids"
                        filterData={breedOptions.map((o) => ({ key: o.value, label: o.label, value: o.value }))}
                        placeHolder={BREED_OPTIONS_PLACEHOLDER}
                    />
                </div>
            ),
        },
        {
            title: "Масть",
            key: "coat_color_name",
            width: 150,
            sorter: true,
            render: (record: HorseOutDto) => {
                const coatColor = record.coat_color;
                if (!coatColor) return <span>—</span>;
                const name = coatColor.short_name ?? coatColor.name;
                return <span>{trimText(name, 32)}</span>;
            },
            filterIcon: (
                <SearchOutlined
                    style={{
                        color:
                            Array.isArray(filters.coat_color_ids) &&
                            filters.coat_color_ids.length > 0
                                ? "#1677ff"
                                : undefined,
                    }}
                />
            ),
            filterDropdown: (
                <div style={{ padding: 8, minWidth: 250 }}>
                    <ListFilter
                        filters={filters}
                        setFilters={(value) => {
                            const newFilters =
                                typeof value === "function" ? value(filters) : value;
                            setFilters({ ...newFilters, offset: 0 });
                        }}
                        filterKey="coat_color_ids"
                        filterData={coatColorOptions.map((o) => ({ key: o.value, label: o.label, value: o.value }))}
                        placeHolder={COAT_COLOR_OPTIONS_PLACEHOLDER}
                    />
                </div>
            ),
        },
        {
            title: "Пол",
            key: "sex",
            dataIndex: "sex",
            width: 100,
            sorter: true,
            render: (sex: string) => <span>{SEX_LABELS[sex] ?? sex}</span>,
            filterIcon: (
                <SearchOutlined
                    style={{
                        color:
                            Array.isArray(filters.sex) && filters.sex.length > 0
                                ? "#1677ff"
                                : undefined,
                    }}
                />
            ),
            filterDropdown: (
                <div style={{ padding: 8, minWidth: 200 }}>
                    <ListFilter
                        filters={filters}
                        setFilters={(value) => {
                            const newFilters =
                                typeof value === "function" ? value(filters) : value;
                            setFilters({ ...newFilters, offset: 0 });
                        }}
                        filterKey="sex"
                        filterData={SEX_OPTIONS}
                        placeHolder="Пол"
                    />
                </div>
            ),
        },
        {
            title: "Владелец",
            key: "horse_owner",
            width: 150,
            render: (record: HorseOutDto) => (
                <span>{trimText(record.horse_owner?.name ?? "—", 32)}</span>
            ),
            filterIcon: (
                <SearchOutlined
                    style={{
                        color:
                            Array.isArray(filters.horse_owner_ids) &&
                            filters.horse_owner_ids.length > 0
                                ? "#1677ff"
                                : undefined,
                    }}
                />
            ),
            filterDropdown: (
                <div style={{ padding: 8, minWidth: 250 }}>
                    <ListFilter
                        filters={filters}
                        setFilters={(value) => {
                            const newFilters =
                                typeof value === "function" ? value(filters) : value;
                            setFilters({ ...newFilters, offset: 0 });
                        }}
                        filterKey="horse_owner_ids"
                        filterData={ownerOptions.map((o) => ({ key: o.value, label: o.label, value: o.value }))}
                        placeHolder="Выберите владельца"
                    />
                </div>
            ),
        },
        {
            title: "Возраст",
            key: "age",
            dataIndex: "age",
            width: 80,
            render: (age: number | null) => <span>{age ?? "—"}</span>,
        },
        {
            title: "Путь URL",
            key: "slug",
            dataIndex: "slug",
            width: 160,
            render: (slug: string) => (
                <span className="text-blue-900 text-sm">{trimText(slug, 32)}</span>
            ),
        },
        {
            title: "Действия",
            key: "actions",
            width: 180,
            render: (record: HorseOutDto | HorseWithPedigreeOutDto) => (
                <div className="flex gap-1">
                    <GrayCountBadge count={record.photos?.length ?? 0}>
                      <Button
                        size="small"
                        aria-label="Фотографии"
                        onClick={(e) => {
                            e.stopPropagation();
                            onPhotosClick(record.id);
                        }}
                    >
                        <FileImageOutlined style={{ color: "#8c8c8c" }} />
                      </Button>
                    </GrayCountBadge>
                    <PedigreeIndicator
                        horse={record}
                        onClick={() => onPedigreeClick(record.id)}
                    />
                    <GrayCountBadge count={record.services?.length ?? 0}>
                        <Button
                            size="small"
                            aria-label="Услуги"
                            onClick={(e) => {
                                e.stopPropagation();
                                onServicesClick(record.id);
                            }}
                        >
                            <DollarOutlined style={{ color: "#8c8c8c" }} />
                        </Button>
                    </GrayCountBadge>
                </div>
            ),
        },
    ];

    return (
        <>
            {error && <Alert type="error" showIcon message="Не удалось загрузить лошадей" description={error} />}
            <MainTable
            сolumns={columns}
            data={tableData}
            loading={loading}
            filtersElements={filtersElements}
            onSortChange={handleSortChange}
            currentSort={filters.sort as string[]}
            onRow={(record) => ({
                onClick: () => onOpenHorseModal(record.key as UUID),
            })}
            />
        </>
    );
};
