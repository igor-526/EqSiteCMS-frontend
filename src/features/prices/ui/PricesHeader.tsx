import { PriceGroupListQueryParams } from "@/types/api/priceGroups";
import { PriceListQueryParams } from "@/types/api/prices";
import { FiltersBaseType, FiltersSetter } from "@/types/filters/filterBase";
import { TablePaginator } from "@/ui";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";
import { PricesTabs, PricesTabsEnum } from "./PricesTabs";
import { PRICE_PAGE_SCOPES_ACTIONS } from "../hooks/usePriceScopes";
import { usePricePageActionScopes } from "../hooks/usePriceScopes";

export type PricesHeaderProps = {
    activeTab: PricesTabsEnum;
    setActiveTab: (tab: PricesTabsEnum) => void;
    onCreatePriceGroup: () => void;
    onCreatePrice: () => void;
    resetPriceGroupsFilters: () => void;
    resetPricesFilters: () => void;
    priceGroupsTotal: number;
    priceGroupsFilters: PriceGroupListQueryParams;
    setPriceGroupsFilters: (filters: PriceGroupListQueryParams) => void;
    priceTotal: number;
    priceFilters: PriceListQueryParams;
    setPriceFilters: (filters: PriceListQueryParams) => void;
};

export const PricesHeader: React.FC<PricesHeaderProps> = ({
    activeTab,
    setActiveTab,
    onCreatePriceGroup,
    onCreatePrice,
    resetPriceGroupsFilters,
    resetPricesFilters,
    priceGroupsTotal,
    priceGroupsFilters,
    setPriceGroupsFilters,
    priceTotal,
    priceFilters,
    setPriceFilters,
}) => {
    const { hasPermission } = usePricePageActionScopes();
    
    const getSelectedFilters = () => {
        switch (activeTab) {
            case PricesTabsEnum.GROUPS:
                return priceGroupsFilters;
            case PricesTabsEnum.PRICES:
                return priceFilters;
        }
    }

    const getSelectedTotal = () => {
        switch (activeTab) {
            case PricesTabsEnum.GROUPS:
                return priceGroupsTotal;
            case PricesTabsEnum.PRICES:
                return priceTotal;
        }
    }

    const handleCreateButtonClick = () => {
        switch (activeTab) {
            case PricesTabsEnum.GROUPS:
                onCreatePriceGroup();
                break;
            case PricesTabsEnum.PRICES:
                onCreatePrice();
                break;
        }
    }

    const handleResetFilters = () => {
        switch (activeTab) {
            case PricesTabsEnum.GROUPS:
                resetPriceGroupsFilters();
                break;
            case PricesTabsEnum.PRICES:
                resetPricesFilters();
                break;
        }
    }

    const handleSetFilters = (filters: FiltersBaseType) => {
        switch (activeTab) {
            case PricesTabsEnum.GROUPS:
                setPriceGroupsFilters(filters as PriceGroupListQueryParams);
                break;
            case PricesTabsEnum.PRICES:
                setPriceFilters(filters as PriceListQueryParams);
                break;
        }
    }

    const getCreateButtonAvailable = () => {
        switch (activeTab) {
            case PricesTabsEnum.GROUPS:
                return hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_GROUP_CREATE);
            case PricesTabsEnum.PRICES:
                return hasPermission(PRICE_PAGE_SCOPES_ACTIONS.PRICE_CREATE);
        }
    }

    return (
        <>
            <PricesTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
            <div className="flex items-center gap-2">
                <TablePaginator
                    filters={getSelectedFilters() as FiltersBaseType}
                    setFilters={handleSetFilters as FiltersSetter<FiltersBaseType>}
                    total={getSelectedTotal() || 0}
                />
                <Button color="danger" variant="outlined" onClick={handleResetFilters}>
                    <FilterOutlined /> Сбросить
                </Button>
                {getCreateButtonAvailable() && (
                    <Button color="primary" variant="outlined" onClick={handleCreateButtonClick}>
                        <PlusOutlined />Добавить
                    </Button>
                )}
            </div>
        </>
    );
};



