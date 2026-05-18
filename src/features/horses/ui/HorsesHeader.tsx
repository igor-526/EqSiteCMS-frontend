import { HorseBreedListQueryParams } from "@/types/api/horseBreeds";
import { HorseCoatColorListQueryParams } from "@/types/api/horseCoatColor";
import { HorseOwnerListQueryParams } from "@/types/api/horseOwners";
import { HorseServiceListQueryParams } from "@/types/api/horseServices";
import { HorseKind, HorseListQueryParams, HorseSex } from "@/types/api/horses";
import { FiltersBaseType, FiltersSetter } from "@/types/filters/filterBase";
import { TablePaginator } from "@/ui";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Select, Spin } from "antd";
import { UUID } from "crypto";
import React from "react";
import { HorsesTabs, HorsesTabsKeys } from "./HorsesTabs";
import {
    HORSES_PAGE_SCOPES_ACTIONS,
    useHorsePageActionScopes,
} from "../hooks/useHorseScopes";

const KIND_OPTIONS = [
    { label: "Лошадь", value: "horse" },
    { label: "Пони", value: "pony" },
];

const SEX_OPTIONS = [
    { label: "Жеребец", value: "male" },
    { label: "Кобыла", value: "female" },
    { label: "Мерин", value: "geld" },
];

const THIS_STABLE_OPTIONS = [
    { label: "Все", value: "all" },
    { label: "Наши", value: "true" },
    { label: "Чужие", value: "false" },
];

export type HorsesHeaderProps = {
    activeTab: HorsesTabsKeys;
    setActiveTab: (tab: HorsesTabsKeys) => void;
    // Horses tab
    onCreateHorse: () => void;
    horsesTotal: number;
    horsesFilters: HorseListQueryParams;
    setHorsesFilters: (filters: HorseListQueryParams) => void;
    setHorsesPage: (offset: number) => void;
    setHorsesLimit: (limit: number) => void;
    resetHorsesFilters: () => void;
    breedFilterOptions: { label: string; value: string }[];
    breedFilterLoading: boolean;
    coatColorFilterOptions: { label: string; value: string }[];
    coatColorFilterLoading: boolean;
    ownerFilterOptions: { label: string; value: string }[];
    ownerFilterLoading: boolean;
    // Other tabs
    onCreateHorseBreedModal: () => void;
    onCreateHorseOwnerModal: () => void;
    onCreateHorseServiceModal: () => void;
    onCreateHorseCoatColorModal: () => void;
    resetHorseBreedsFilters: () => void;
    resetHorseOwnersFilters: () => void;
    resetHorseServicesFilters: () => void;
    resetHorseCoatColorsFilters: () => void;
    horseBreedsTotal: number;
    horseOwnersTotal: number;
    horseServicesTotal: number;
    horseCoatColorsTotal: number;
    horseBreedsFilters: HorseBreedListQueryParams;
    horseOwnersFilters: HorseOwnerListQueryParams;
    horseServicesFilters: HorseServiceListQueryParams;
    horseCoatColorsFilters: HorseCoatColorListQueryParams;
    setHorseBreedsFilters: FiltersSetter<HorseBreedListQueryParams>;
    setHorseOwnersFilters: (filters: HorseOwnerListQueryParams) => void;
    setHorseServicesFilters: (filters: HorseServiceListQueryParams) => void;
    setHorseCoatColorsFilters: (filters: HorseCoatColorListQueryParams) => void;
};

export const HorsesHeader: React.FC<HorsesHeaderProps> = ({
    activeTab,
    setActiveTab,
    onCreateHorse,
    horsesTotal,
    horsesFilters,
    setHorsesFilters,
    setHorsesPage,
    setHorsesLimit,
    resetHorsesFilters,
    breedFilterOptions,
    breedFilterLoading,
    coatColorFilterOptions,
    coatColorFilterLoading,
    ownerFilterOptions,
    ownerFilterLoading,
    onCreateHorseBreedModal,
    onCreateHorseOwnerModal,
    onCreateHorseServiceModal,
    onCreateHorseCoatColorModal,
    resetHorseBreedsFilters,
    resetHorseOwnersFilters,
    resetHorseServicesFilters,
    resetHorseCoatColorsFilters,
    horseBreedsTotal,
    horseOwnersTotal,
    horseServicesTotal,
    horseCoatColorsTotal,
    horseBreedsFilters,
    horseOwnersFilters,
    horseServicesFilters,
    horseCoatColorsFilters,
    setHorseBreedsFilters,
    setHorseOwnersFilters,
    setHorseServicesFilters,
    setHorseCoatColorsFilters,
}) => {
    const { hasPermission } = useHorsePageActionScopes();
    const canCreate = hasPermission(HORSES_PAGE_SCOPES_ACTIONS.CREATE_HORSE);

    const getSelectedFilters = () => {
        switch (activeTab) {
            case HorsesTabsKeys.BREEDS:
                return horseBreedsFilters;
            case HorsesTabsKeys.OWNERS:
                return horseOwnersFilters;
            case HorsesTabsKeys.SERVICES:
                return horseServicesFilters;
            case HorsesTabsKeys.COAT_COLORS:
                return horseCoatColorsFilters;
            default:
                return undefined;
        }
    };

    const getSelectedTotal = () => {
        switch (activeTab) {
            case HorsesTabsKeys.BREEDS:
                return horseBreedsTotal;
            case HorsesTabsKeys.OWNERS:
                return horseOwnersTotal;
            case HorsesTabsKeys.SERVICES:
                return horseServicesTotal;
            case HorsesTabsKeys.COAT_COLORS:
                return horseCoatColorsTotal;
            default:
                return 0;
        }
    };

    const handleResetFilters = () => {
        switch (activeTab) {
            case HorsesTabsKeys.HORSES:
                resetHorsesFilters();
                break;
            case HorsesTabsKeys.BREEDS:
                resetHorseBreedsFilters();
                break;
            case HorsesTabsKeys.OWNERS:
                resetHorseOwnersFilters();
                break;
            case HorsesTabsKeys.SERVICES:
                resetHorseServicesFilters();
                break;
            case HorsesTabsKeys.COAT_COLORS:
                resetHorseCoatColorsFilters();
                break;
        }
    };

    const handleCreate = () => {
        switch (activeTab) {
            case HorsesTabsKeys.HORSES:
                onCreateHorse();
                break;
            case HorsesTabsKeys.BREEDS:
                onCreateHorseBreedModal();
                break;
            case HorsesTabsKeys.OWNERS:
                onCreateHorseOwnerModal();
                break;
            case HorsesTabsKeys.SERVICES:
                onCreateHorseServiceModal();
                break;
            case HorsesTabsKeys.COAT_COLORS:
                onCreateHorseCoatColorModal();
                break;
        }
    };

    const handleSetFilters: FiltersSetter<FiltersBaseType> = (value) => {
        switch (activeTab) {
            case HorsesTabsKeys.BREEDS: {
                setHorseBreedsFilters((prev) => {
                    const resolved =
                        typeof value === "function" ? value(prev as FiltersBaseType) : value;
                    return resolved as HorseBreedListQueryParams;
                });
                break;
            }
            case HorsesTabsKeys.OWNERS:
                setHorseOwnersFilters(
                    typeof value === "function"
                        ? (value(horseOwnersFilters as FiltersBaseType) as HorseOwnerListQueryParams)
                        : (value as HorseOwnerListQueryParams),
                );
                break;
            case HorsesTabsKeys.SERVICES:
                setHorseServicesFilters(
                    typeof value === "function"
                        ? (value(horseServicesFilters as FiltersBaseType) as HorseServiceListQueryParams)
                        : (value as HorseServiceListQueryParams),
                );
                break;
            case HorsesTabsKeys.COAT_COLORS:
                setHorseCoatColorsFilters(
                    typeof value === "function"
                        ? (value(horseCoatColorsFilters as FiltersBaseType) as HorseCoatColorListQueryParams)
                        : (value as HorseCoatColorListQueryParams),
                );
                break;
        }
    };

    const showAddButton =
        activeTab !== HorsesTabsKeys.USER_DOCS &&
        activeTab !== HorsesTabsKeys.DEVELOPER_DOCS;

    const isHorsesTab = activeTab === HorsesTabsKeys.HORSES;
    const isBreedFilterActive =
        Array.isArray(horsesFilters.breed_ids) && horsesFilters.breed_ids.length > 0;

    return (
        <>
            <HorsesTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex items-center gap-2 flex-wrap">
                {isHorsesTab ? (
                    <>
                        {/* This stable filter */}
                        <Select
                            value={
                                horsesFilters.this_stable === true
                                    ? "true"
                                    : horsesFilters.this_stable === false
                                      ? "false"
                                      : "all"
                            }
                            onChange={(v) =>
                                setHorsesFilters({
                                    ...horsesFilters,
                                    this_stable:
                                        v === "true" ? true : v === "false" ? false : undefined,
                                    offset: 0,
                                })
                            }
                            options={THIS_STABLE_OPTIONS}
                            style={{ width: 100 }}
                        />
                        {/* Breed filter */}
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Породы"
                            value={(horsesFilters.breed_ids ?? []) as UUID[]}
                            onChange={(values: UUID[]) =>
                                setHorsesFilters({
                                    ...horsesFilters,
                                    breed_ids: values.length > 0 ? values : undefined,
                                    kind: values.length > 0 ? undefined : horsesFilters.kind,
                                    offset: 0,
                                })
                            }
                            notFoundContent={
                                breedFilterLoading ? <Spin size="small" /> : "Породы не найдены"
                            }
                            options={breedFilterOptions}
                            style={{ minWidth: 140 }}
                            filterOption={true}
                            optionFilterProp="label"
                        />
                        {/* Coat color filter */}
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Масти"
                            value={(horsesFilters.coat_color_ids ?? []) as UUID[]}
                            onChange={(values: UUID[]) =>
                                setHorsesFilters({
                                    ...horsesFilters,
                                    coat_color_ids: values.length > 0 ? values : undefined,
                                    offset: 0,
                                })
                            }
                            notFoundContent={
                                coatColorFilterLoading ? (
                                    <Spin size="small" />
                                ) : (
                                    "Масти не найдены"
                                )
                            }
                            options={coatColorFilterOptions}
                            style={{ minWidth: 140 }}
                            filterOption={true}
                            optionFilterProp="label"
                        />
                        {/* Owner filter */}
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Владельцы"
                            value={(horsesFilters.horse_owner_ids ?? []) as UUID[]}
                            onChange={(values: UUID[]) =>
                                setHorsesFilters({
                                    ...horsesFilters,
                                    horse_owner_ids: values.length > 0 ? values : undefined,
                                    offset: 0,
                                })
                            }
                            notFoundContent={
                                ownerFilterLoading ? (
                                    <Spin size="small" />
                                ) : (
                                    "Владельцы не найдены"
                                )
                            }
                            options={ownerFilterOptions}
                            style={{ minWidth: 140 }}
                            filterOption={true}
                            optionFilterProp="label"
                        />
                        {/* Kind filter */}
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Тип"
                            disabled={isBreedFilterActive}
                            value={isBreedFilterActive ? [] : (horsesFilters.kind ?? []) as HorseKind[]}
                            onChange={(values: HorseKind[]) =>
                                setHorsesFilters({
                                    ...horsesFilters,
                                    kind: values.length > 0 ? values : undefined,
                                    offset: 0,
                                })
                            }
                            options={KIND_OPTIONS}
                            style={{ minWidth: 120 }}
                        />
                        {/* Sex filter */}
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Пол"
                            value={(horsesFilters.sex ?? []) as HorseSex[]}
                            onChange={(values: HorseSex[]) =>
                                setHorsesFilters({
                                    ...horsesFilters,
                                    sex: values.length > 0 ? values : undefined,
                                    offset: 0,
                                })
                            }
                            options={SEX_OPTIONS}
                            style={{ minWidth: 120 }}
                        />
                        <TablePaginator
                            filters={horsesFilters as FiltersBaseType}
                            setFilters={
                                ((updater: (prev: FiltersBaseType) => FiltersBaseType | FiltersBaseType) => {
                                    const prev = horsesFilters as FiltersBaseType;
                                    const resolved =
                                        typeof updater === "function"
                                            ? updater(prev)
                                            : updater;
                                    const newFilters = resolved as HorseListQueryParams;
                                    if (newFilters.limit !== prev.limit) {
                                        setHorsesLimit(newFilters.limit as number);
                                    } else {
                                        setHorsesPage(newFilters.offset as number);
                                    }
                                }) as FiltersSetter<FiltersBaseType>
                            }
                            total={horsesTotal}
                        />
                    </>
                ) : (
                    <TablePaginator
                        filters={getSelectedFilters() as FiltersBaseType}
                        setFilters={handleSetFilters}
                        total={getSelectedTotal() || 0}
                    />
                )}
                <Button color="danger" variant="outlined" onClick={handleResetFilters}>
                    <FilterOutlined /> Сбросить
                </Button>
                {showAddButton && (isHorsesTab ? canCreate : true) && (
                    <Button color="primary" variant="outlined" onClick={handleCreate}>
                        <PlusOutlined />
                        Добавить
                    </Button>
                )}
            </div>
        </>
    );
};
