"use client";

import React from "react";
import { Menu } from "antd";
import {
  DashboardIcon,
  ServicesIcon,
  HorsesIcon,
  InfoIcon,
  GalleryIcon,
  UsersIcon,
} from "@/ui/icons";
import { useRouter, usePathname } from "next/navigation";
import { KNOWN_USER_SCOPES } from "@/types/api/user";
import { BellOutlined, PhoneOutlined } from "@ant-design/icons";

interface NavigationMenuProps {
  scopes: KNOWN_USER_SCOPES[];
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ scopes }) => {
  const router = useRouter();
  const pathname = usePathname();

  const canSeeUsers =
    scopes.includes(KNOWN_USER_SCOPES.SUPERUSER) ||
    scopes.includes(KNOWN_USER_SCOPES.USER_MANAGER);
  const canSeeCallbackRequests =
    scopes.includes(KNOWN_USER_SCOPES.ADMIN) ||
    scopes.includes(KNOWN_USER_SCOPES.SUPERUSER);

  const getActiveKey = () => {
    if (pathname?.startsWith("/dashboard")) return "main";
    if (pathname?.startsWith("/horses")) return "horses";
    if (pathname?.startsWith("/site-settings")) return "info";
    if (pathname?.startsWith("/gallery")) return "gallery";
    if (pathname?.startsWith("/prices")) return "prices";
    if (pathname?.startsWith("/news")) return "news";
    if (pathname?.startsWith("/profile")) return "profile";
    if (pathname?.startsWith("/users")) return "users";
    if (pathname?.startsWith("/notifications")) return "notifications";
    if (pathname?.startsWith("/callback-requests")) return "callback-requests";
    return "main";
  };

  const handleMenuClick = (path: string) => {
    if (pathname !== path) {
      router.push(path);
    }
  };

  const items = [
    {
      key: "main",
      label: "Дэшборд",
      icon: <DashboardIcon size={18} />,
      onClick: () => handleMenuClick("/dashboard"),
    },
    {
      key: "horses",
      label: "Лошади",
      icon: <HorsesIcon size={18} />,
      onClick: () => handleMenuClick("/horses"),
    },
    {
      key: "info",
      label: "Настройки сайта",
      icon: <InfoIcon size={18} />,
      onClick: () => handleMenuClick("/site-settings"),
    },
    {
      key: "gallery",
      label: "Галерея",
      icon: <GalleryIcon size={18} />,
      onClick: () => handleMenuClick("/gallery"),
    },
    {
      key: "prices",
      label: "Услуги и цены",
      icon: <ServicesIcon size={18} />,
      onClick: () => handleMenuClick("/prices"),
    },
    {
      key: "notifications",
      label: "Уведомления",
      icon: <BellOutlined />,
      onClick: () => handleMenuClick("/notifications"),
    },
    {
      key: "news",
      label: "Новости",
      icon: <InfoIcon size={18} />,
      onClick: () => handleMenuClick("/news"),
    },
    ...(canSeeUsers
      ? [
          {
            key: "users",
            label: "Пользователи",
            icon: <UsersIcon size={18} />,
            onClick: () => handleMenuClick("/users"),
          },
        ]
      : []),
    ...(canSeeCallbackRequests
      ? [
          {
            key: "callback-requests",
            label: "Заявки на обратный звонок",
            icon: <PhoneOutlined />,
            onClick: () => handleMenuClick("/callback-requests"),
          },
        ]
      : []),
  ];

  return (
    <Menu
      theme="dark"
      selectedKeys={[getActiveKey()]}
      items={items}
      style={{ flex: 1 }}
    />
  );
};
