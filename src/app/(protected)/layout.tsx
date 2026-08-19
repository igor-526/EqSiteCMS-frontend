"use client";

import { useState, useEffect } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { usePageTitleContext } from "@/contexts/PageTitleContext";
import { useUserContext } from "@/contexts/UserContext";
import { authApiLogout } from "@/api/auth";
import { Sidebar } from "@/ui/Sidebar/Sidebar";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const { Header, Content } = Layout;

// Page titles mapping
const pageTitles: Record<string, string> = {
  "/dashboard": "Дэшборд",
  "/horses": "Лошади",
  "/site-settings": "Настройки сайта",
  "/gallery": "Галерея",
  "/prices": "Услуги и цены",
  "/news": "Новости",
  "/profile": "Профиль",
  "/users": "Пользователи",
  "/notifications": "Уведомления",
};

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { pageTitle, setPageTitle } = usePageTitleContext();
  const { clearUser, user, scopes } = useUserContext();
  const { loading, isAuthenticated } = useAuthGuard();

  const isProfileActive = pathname?.startsWith("/profile") ?? false;

  // Update title when path changes
  useEffect(() => {
    if (pathname) {
      const title = Object.keys(pageTitles).find((key) =>
        pathname.startsWith(key),
      );
      if (title) {
        setPageTitle(pageTitles[title]);
      } else {
        setPageTitle("Страница");
      }
    }
  }, [pathname, setPageTitle]);

  const handleProfileClick = () => {
    if (pathname !== "/profile") {
      router.push("/profile");
    }
  };

  const handleLogout = async () => {
    clearUser();
    await authApiLogout();
    router.push("/login");
  };

  if (loading || !isAuthenticated) return null;

  return (
    <Layout className="h-screen">
      <Sidebar
        collapsed={collapsed}
        user={user}
        scopes={scopes}
        isProfileActive={isProfileActive}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
      />
      <Layout className="flex flex-col h-screen overflow-y-hidden">
        <Header style={{ padding: 0, background: "#FFFFFF" }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <span style={{ color: "grey", fontSize: 18, fontWeight: 600 }}>
            {pageTitle}
          </span>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#FFFFFF",
            borderRadius: 8,
          }}
        >
          <div className="h-full overflow-y-auto overflow-x-auto">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BaseLayout;
