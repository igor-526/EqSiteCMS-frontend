import { Tabs } from "antd";
import React from "react";
import {
    NEWS_PAGE_SCOPES_ACTIONS,
    useNewsPageActionScopes,
} from "../hooks/useNewsScopes";

export enum NewsTabsEnum {
    NEWS = "news",
    ADMIN_DOCS = "admin_docs",
    DEVELOPER_DOCS = "developer_docs",
}

export type NewsTabsProps = {
    activeTab: NewsTabsEnum;
    setActiveTab: (tab: NewsTabsEnum) => void;
};

export const NewsTabs: React.FC<NewsTabsProps> = ({ activeTab, setActiveTab }) => {
    const { hasPermission } = useNewsPageActionScopes();

    const items: { key: NewsTabsEnum; label: string }[] = [
        { key: NewsTabsEnum.NEWS, label: "Новости" },
    ];

    if (hasPermission(NEWS_PAGE_SCOPES_ACTIONS.SEE_ADMIN_INSTRUCTIONS)) {
        items.push({ key: NewsTabsEnum.ADMIN_DOCS, label: "Инструкция" });
    }

    if (hasPermission(NEWS_PAGE_SCOPES_ACTIONS.SEE_DEVELOPER_DOCS)) {
        items.push({ key: NewsTabsEnum.DEVELOPER_DOCS, label: "Документация" });
    }

    return (
        <div className="flex items-center">
            <Tabs
                activeKey={activeTab}
                items={items}
                onChange={(key) => setActiveTab(key as NewsTabsEnum)}
            />
        </div>
    );
};
