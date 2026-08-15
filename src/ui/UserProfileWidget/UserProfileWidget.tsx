"use client";

import React from "react";
import { LogoutIcon } from "@/ui/icons";
import { User } from "@/types/api/user";

interface UserProfileWidgetProps {
  user: User | null;
  collapsed: boolean;
  isActive: boolean;
  onProfileClick: () => void;
  onLogout: () => void;
}

function formatShortName(
  last_name: string | null,
  first_name: string | null,
  middle_name: string | null,
  username: string,
): string {
  if (!last_name) return username;
  const firstInitial = first_name ? `${first_name[0]}.` : "";
  const middleInitial = middle_name ? `${middle_name[0]}.` : "";
  return [last_name, firstInitial, middleInitial].filter(Boolean).join(" ");
}

export const UserProfileWidget: React.FC<UserProfileWidgetProps> = ({
  user,
  collapsed,
  isActive,
  onProfileClick,
  onLogout,
}) => {
  const avatarLetter = user?.username?.charAt(0)?.toUpperCase() ?? "?";
  const displayName = user
    ? formatShortName(
        user.last_name,
        user.first_name,
        user.middle_name,
        user.username,
      )
    : "";

  return (
    <>
      {/* Profile */}
      <div
        role="button"
        tabIndex={0}
        onClick={onProfileClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onProfileClick();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : 10,
          padding: collapsed ? "12px 0" : "12px 16px",
          cursor: "pointer",
          background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
          transition: "background 0.2s",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
        aria-label="Профиль"
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "#1677ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {avatarLetter}
          </span>
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden", minWidth: 0 }}>
            <div
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 11,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              @{user?.username}
            </div>
          </div>
        )}
      </div>
      {/* Logout */}
      <div
        role="button"
        tabIndex={0}
        onClick={onLogout}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onLogout();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : 10,
          padding: collapsed ? "12px 0" : "12px 16px",
          cursor: "pointer",
          justifyContent: collapsed ? "center" : "flex-start",
          color: "rgba(255,255,255,0.65)",
        }}
        aria-label="Выйти"
      >
        <LogoutIcon size={18} />
        {!collapsed && (
          <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>
            Выйти
          </span>
        )}
      </div>
    </>
  );
};
