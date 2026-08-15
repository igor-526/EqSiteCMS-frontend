"use client";

import React from "react";
import { Layout } from "antd";
import { NavigationMenu } from "@/ui/NavigationMenu/NavigationMenu";
import { UserProfileWidget } from "@/ui/UserProfileWidget/UserProfileWidget";
import { User, KNOWN_USER_SCOPES } from "@/types/api/user";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  user: User | null;
  scopes: KNOWN_USER_SCOPES[];
  isProfileActive: boolean;
  onProfileClick: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  user,
  scopes,
  isProfileActive,
  onProfileClick,
  onLogout,
}) => {
  return (
    <Sider
      collapsedWidth="50"
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <NavigationMenu scopes={scopes} />
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "8px 0",
          }}
        >
          <UserProfileWidget
            user={user}
            collapsed={collapsed}
            isActive={isProfileActive}
            onProfileClick={onProfileClick}
            onLogout={onLogout}
          />
        </div>
      </div>
    </Sider>
  );
};
