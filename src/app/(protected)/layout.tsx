"use client"

import { useState, useEffect } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import { useRouter, usePathname } from "next/navigation";
import {
    DashboardIcon,
    ServicesIcon,
    LogoutIcon,
    HorsesIcon,
    InfoIcon,
    GalleryIcon,
} from '@/ui/icons';
import { usePageTitleContext } from '@/contexts/PageTitleContext';
import { useUserContext } from '@/contexts/UserContext';
import { authApiLogout } from '@/api/auth';

const { Header, Sider, Content } = Layout;

// Маппинг путей к заголовкам
const pageTitles: Record<string, string> = {
    '/dashboard': 'Дэшборд',
    '/horses': 'Лошади',
    '/site-settings': 'Настройки сайта',
    '/gallery': 'Галерея',
    '/prices': 'Услуги и цены',
};

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
    const [collapsed, setCollapsed] = useState(true)
    const router = useRouter();
    const pathname = usePathname();
    const { pageTitle, setPageTitle } = usePageTitleContext();
    const { clearUser } = useUserContext();

    // Определяем активный ключ на основе текущего пути
    const getActiveKey = () => {
        if (pathname?.startsWith('/dashboard')) return 'main';
        if (pathname?.startsWith('/horses')) return 'horses';
        if (pathname?.startsWith('/site-settings')) return 'info';
        if (pathname?.startsWith('/gallery')) return 'gallery';
        if (pathname?.startsWith('/prices')) return 'prices';
        return 'main';
    };

    // Обновляем заголовок при изменении пути
    useEffect(() => {
        if (pathname) {
            // Ищем точное совпадение или начинающийся путь
            const title = Object.keys(pageTitles).find(key => pathname.startsWith(key));
            if (title) {
                setPageTitle(pageTitles[title]);
            } else {
                setPageTitle('Страница');
            }
        }
    }, [pathname, setPageTitle]);

    const handleMenuClick = (path: string) => {
        if (pathname !== path) {
            router.push(path);
        }
    };

    const handleLogout = async () => {
        clearUser();
        await authApiLogout();
        router.push('/login');
    };

    const items = [
        {
            key: 'main',
            label: 'Дэшборд',
            icon: <DashboardIcon size={18} />,
            onClick: () => { handleMenuClick('/dashboard') }
        },
        {
            key: 'horses',
            label: 'Лошади',
            icon: <HorsesIcon size={18} />,
            onClick: () => { handleMenuClick('/horses') }
        },
        {
            key: 'info',
            label: 'Настройки сайта',
            icon: <InfoIcon size={18} />,
            onClick: () => { handleMenuClick('/site-settings') }
        },
        {
            key: 'gallery',
            label: 'Галерея',
            icon: <GalleryIcon size={18} />,
            onClick: () => { handleMenuClick('/gallery') }
        },
        {
            key: 'prices',
            label: 'Услуги и цены',
            icon: <ServicesIcon size={18} />,
            onClick: () => { handleMenuClick('/prices') }
        },
        {
            key: 'logout',
            label: 'Выйти',
            icon: <LogoutIcon size={18} />,
            onClick: handleLogout
        },
    ]

    return (
        <Layout className="h-screen">
            <Sider
                collapsedWidth="50"
                trigger={null}
                collapsible
                collapsed={collapsed}
            >
                <Menu
                    theme="dark"
                    mode="vertical"
                    selectedKeys={[getActiveKey()]}
                    items={items}
                />
            </Sider>
            <Layout className="flex flex-col h-screen overflow-y-hidden">
                <Header style={{ padding: 0, background: "#FFFFFF" }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <span style={{color: "grey", fontSize: 18, fontWeight: 600}}>{pageTitle}</span>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
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