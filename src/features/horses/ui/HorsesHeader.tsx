import { HorseBreedListQueryParams } from "@/types/api/horseBreeds";
import { HorseCoatColorListQueryParams } from "@/types/api/horseCoatColor";
import { HorseOwnerListQueryParams } from "@/types/api/horseOwners";
import { HorseServiceListQueryParams } from "@/types/api/horseServices";
import { FiltersBaseType, FiltersSetter } from "@/types/filters/filterBase";
import { TablePaginator } from "@/ui";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { HorsesTabs, HorsesTabsKeys } from "./HorsesTabs";

export type HorsesHeaderProps = {
    activeTab: HorsesTabsKeys;
    setActiveTab: (tab: HorsesTabsKeys) => void;
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
    setHorseBreedsFilters: (filters: HorseBreedListQueryParams) => void;
    setHorseOwnersFilters: (filters: HorseOwnerListQueryParams) => void;
    setHorseServicesFilters: (filters: HorseServiceListQueryParams) => void;
    setHorseCoatColorsFilters: (filters: HorseCoatColorListQueryParams) => void;
};

export const HorsesHeader: React.FC<HorsesHeaderProps> = ({
    activeTab,
    setActiveTab,
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
        }
    }

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
        }
    }

    const handleResetFilters = () => {
        switch (activeTab) {
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
    }

    const handleCreate = () => {
        switch (activeTab) {
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
    }

    const handleSetFilters = (filters: FiltersBaseType) => {
        switch (activeTab) {
            case HorsesTabsKeys.BREEDS:
                setHorseBreedsFilters(filters as HorseBreedListQueryParams);
                break;
            case HorsesTabsKeys.OWNERS:
                setHorseOwnersFilters(filters as HorseOwnerListQueryParams);
                break;
            case HorsesTabsKeys.SERVICES:
                setHorseServicesFilters(filters as HorseServiceListQueryParams);
                break;
            case HorsesTabsKeys.COAT_COLORS:
                setHorseCoatColorsFilters(filters as HorseCoatColorListQueryParams);
                break;
        }
    }

    return (
        <>
            <HorsesTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex items-center gap-2">
                <TablePaginator
                    filters={getSelectedFilters() as FiltersBaseType}
                    setFilters={handleSetFilters as FiltersSetter<FiltersBaseType>}
                    total={getSelectedTotal() || 0}
                />
                <Button color="danger" variant="outlined" onClick={handleResetFilters}>
                    <FilterOutlined /> Сбросить
                </Button>
                <Button color="primary" variant="outlined" onClick={handleCreate}>
                    <PlusOutlined />Добавить
                </Button>
            </div>
        </>
    );
};