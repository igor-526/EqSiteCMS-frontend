import { Tabs } from "antd";
import React from "react";
import {
  HORSES_PAGE_SCOPES_ACTIONS,
  useHorsePageActionScopes,
} from "../hooks/useHorseScopes";

export enum HorsesTabsKeys {
  HORSES = "horses",
  BREED_GROUPS = "breed-groups",
  BREEDS = "breeds",
  COAT_COLORS = "coat-colors",
  OWNERS = "owners",
  SERVICES = "services",
  USER_DOCS = "user_docs",
  DEVELOPER_DOCS = "developer_docs",
}

export type HorsesTabsProps = {
  activeTab: HorsesTabsKeys;
  setActiveTab: (tab: HorsesTabsKeys) => void;
};

export const HorsesTabs: React.FC<HorsesTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { hasPermission } = useHorsePageActionScopes();

  const items: { key: HorsesTabsKeys; label: string }[] = [
    { key: HorsesTabsKeys.HORSES, label: "Лошади" },
    { key: HorsesTabsKeys.BREED_GROUPS, label: "Группы пород" },
    { key: HorsesTabsKeys.BREEDS, label: "Породы" },
    { key: HorsesTabsKeys.COAT_COLORS, label: "Масти" },
    { key: HorsesTabsKeys.OWNERS, label: "Владельцы" },
    { key: HorsesTabsKeys.SERVICES, label: "Услуги" },
  ];

  if (hasPermission(HORSES_PAGE_SCOPES_ACTIONS.SEE_USER_DOCS)) {
    items.push({ key: HorsesTabsKeys.USER_DOCS, label: "Инструкция" });
  }

  if (hasPermission(HORSES_PAGE_SCOPES_ACTIONS.SEE_DEVELOPER_DOCS)) {
    items.push({ key: HorsesTabsKeys.DEVELOPER_DOCS, label: "Документация" });
  }

  return (
    <div className="flex items-center">
      <Tabs
        activeKey={activeTab}
        items={items}
        onChange={(key) => setActiveTab(key as HorsesTabsKeys)}
      />
    </div>
  );
};
