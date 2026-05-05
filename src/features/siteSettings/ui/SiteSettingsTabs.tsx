import { Tabs } from "antd";
import React from "react";

export type SiteSettingsTabsProps = {
    activeTab: string;
    setActiveTab: (tab: string) => void;

};

export const SiteSettingsTabs: React.FC<SiteSettingsTabsProps> = ({
    activeTab,
    setActiveTab,
}) => {
    const items = [
        {
            key: 'settings',
            label: 'Настройки сайта',
        },
        {
            key: 'developerDocumentation',
            label: 'Документация',
        },
        {
            key: 'userDocumentation',
            label: 'Инструкция',
        }
    ];
    return (
        <div className="flex items-center">
            <Tabs activeKey={activeTab} items={items} onChange={setActiveTab} />
        </div>
    );
};



