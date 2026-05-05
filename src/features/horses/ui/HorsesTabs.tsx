import { Tabs } from "antd";
import React from "react";

export enum HorsesTabsKeys {
    BREEDS = 'breeds',
    COAT_COLORS = 'coat-colors',
    OWNERS = 'owners',
    SERVICES = 'services',
    DOCUMENTATION = 'documentation',
    INSTRUCTION = 'instruction',
}

export type HorsesTabsProps = {
    activeTab: HorsesTabsKeys;
    setActiveTab: (tab: HorsesTabsKeys) => void;

};

export const HorsesTabs: React.FC<HorsesTabsProps> = ({
    activeTab,
    setActiveTab,
}) => {
    const items = [
        {
            key: HorsesTabsKeys.BREEDS,
            label: 'Породы',
        },
        {
            key: HorsesTabsKeys.COAT_COLORS,
            label: 'Масти',
        },
        {
            key: HorsesTabsKeys.OWNERS,
            label: 'Владельцы',
        },
        {
            key: HorsesTabsKeys.SERVICES,
            label: 'Услуги',
        },
        {
            key: HorsesTabsKeys.DOCUMENTATION,
            label: 'Документация',
        },
        {
            key: HorsesTabsKeys.INSTRUCTION,
            label: 'Инструкция',
        }
    ];
    return (
        <div className="flex items-center">
            <Tabs activeKey={activeTab} items={items} onChange={setActiveTab} />
        </div>
    );
};



