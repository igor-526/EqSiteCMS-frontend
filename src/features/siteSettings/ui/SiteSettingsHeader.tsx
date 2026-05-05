import { FiltersBaseType, FiltersSetter } from "@/types/filters/filterBase";
import { TablePaginator } from "@/ui";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";
import { SiteSettingsTabs } from "./SiteSettingsTabs";
import { SiteSettingListQueryParams } from "@/types/api/siteSettings";

export type SiteSettingsHeaderProps = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onCreateSiteSetting: () => void;
    resetSiteSettingFilters: () => void;
    siteSettingTotal: number;
    siteSettingFilters: SiteSettingListQueryParams;
    setSiteSettingFilters: (filters: SiteSettingListQueryParams) => void;
};

export const SiteSettingsHeader: React.FC<SiteSettingsHeaderProps> = ({
    activeTab,
    setActiveTab,
    onCreateSiteSetting,
    resetSiteSettingFilters,
    siteSettingTotal,
    siteSettingFilters,
    setSiteSettingFilters,
}) => {
    return (
        <>
            <SiteSettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex items-center gap-2">
                <TablePaginator
                    filters={siteSettingFilters as FiltersBaseType}
                    setFilters={setSiteSettingFilters as FiltersSetter<FiltersBaseType>}
                    total={siteSettingTotal}
                />
                <Button color="danger" variant="outlined" onClick={resetSiteSettingFilters}>
                    <FilterOutlined /> Сбросить
                </Button>
                <Button color="primary" variant="outlined" onClick={onCreateSiteSetting}>
                    <PlusOutlined />Добавить
                </Button>
            </div>
        </>
    );
};



