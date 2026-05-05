import { Tabs } from "antd";
import React from "react";
import { PRICE_PAGE_SCOPES_ACTIONS } from "../hooks/usePriceScopes";
import { usePricePageActionScopes } from "../hooks/usePriceScopes";

export enum PricesTabsEnum {
    PRICES = 'prices',
    GROUPS = 'groups',
    DEVELOPER_DOCS = 'developer_docs',
    USER_DOCS = 'user_docs',
}

export type PricesTabsProps = {
    activeTab: PricesTabsEnum;
    setActiveTab: (tab: PricesTabsEnum) => void;
};

export const PricesTabs: React.FC<PricesTabsProps> = ({
    activeTab,
    setActiveTab,
}) => {
    const { hasPermission } = usePricePageActionScopes();
    const items = [
        {
            key: PricesTabsEnum.PRICES,
            label: 'Цены и услуги',
        },
        {
            key: PricesTabsEnum.GROUPS,
            label: 'Группы услуг',
        }
    ];
    if (hasPermission(PRICE_PAGE_SCOPES_ACTIONS.SEE_DEVELOPER_INSTRUCTIONS)) {
        items.push({
            key: PricesTabsEnum.DEVELOPER_DOCS,
            label: 'Документация',
        });
    }
    if (hasPermission(PRICE_PAGE_SCOPES_ACTIONS.SEE_USER_INSTRUCTIONS)) {
        items.push({
            key: PricesTabsEnum.USER_DOCS,
            label: 'Инструкция',
        });
    }
    return (
        <div className="flex items-center">
            <Tabs activeKey={activeTab} items={items} onChange={(key) => setActiveTab(key as PricesTabsEnum)} />
        </div>
    );
};



