import React from "react";
import { Tabs } from "antd";

export enum UsersTabsKey {
  USERS = "users",
  USER_DOCS = "user_docs",
  DEVELOPER_DOCS = "developer_docs",
}

type UsersTabsProps = {
  activeTab: UsersTabsKey;
  setActiveTab: (tab: UsersTabsKey) => void;
};

export const UsersTabs: React.FC<UsersTabsProps> = ({ activeTab, setActiveTab }) => (
  <Tabs
    activeKey={activeTab}
    onChange={(key) => setActiveTab(key as UsersTabsKey)}
    items={[
      { key: UsersTabsKey.USERS, label: "Пользователи" },
      { key: UsersTabsKey.USER_DOCS, label: "Инструкция" },
      { key: UsersTabsKey.DEVELOPER_DOCS, label: "Документация" },
    ]}
  />
);
