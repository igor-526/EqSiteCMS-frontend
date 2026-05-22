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
    '/news': 'Новости',
    '/profile': 'Профиль',
};

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

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
    const [collapsed, setCollapsed] = useState(true)
    const router = useRouter();
    const pathname = usePathname();
    const { pageTitle, setPageTitle } = usePageTitleContext();
    const { clearUser, user } = useUserContext();

    // Определяем активный ключ на основе текущего пути
    const getActiveKey = () => {
        if (pathname?.startsWith('/dashboard')) return 'main';
        if (pathname?.startsWith('/horses')) return 'horses';
        if (pathname?.startsWith('/site-settings')) return 'info';
        if (pathname?.startsWith('/gallery')) return 'gallery';
        if (pathname?.startsWith('/prices')) return 'prices';
        if (pathname?.startsWith('/news')) return 'news';
        if (pathname?.startsWith('/profile')) return 'profile';
        return 'main';
    };

    const isProfileActive = getActiveKey() === 'profile';

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
            key: 'news',
            label: 'Новости',
            icon: <InfoIcon size={18} />,
            onClick: () => { handleMenuClick('/news') }
        },
    ];

    const avatarLetter = user?.username?.charAt(0)?.toUpperCase() ?? "?";
    const displayName = user
        ? formatShortName(user.last_name, user.first_name, user.middle_name, user.username)
        : "";

    return (
        <Layout className="h-screen">
            <Sider
                collapsedWidth="50"
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{ display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <Menu
                            theme="dark"
                            mode="vertical"
                            selectedKeys={[getActiveKey()]}
                            items={items}
                        />
                    </div>
                    {/* Нижняя секция сайдбара */}
                    <div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', margin: '0 0 0 0' }} />
                        {/* Профиль */}
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleMenuClick('/profile')}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleMenuClick('/profile'); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: collapsed ? 0 : 10,
                                padding: collapsed ? '12px 0' : '12px 16px',
                                cursor: 'pointer',
                                background: isProfileActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                                transition: 'background 0.2s',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                            }}
                            aria-label="Профиль"
                        >
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 6,
                                    background: '#1677ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1 }}>
                                    {avatarLetter}
                                </span>
                            </div>
                            {!collapsed && (
                                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                                    <div style={{
                                        color: '#fff',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>
                                        {displayName}
                                    </div>
                                    <div style={{
                                        color: 'rgba(255,255,255,0.45)',
                                        fontSize: 11,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>
                                        @{user?.username}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Выйти */}
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={handleLogout}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLogout(); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: collapsed ? 0 : 10,
                                padding: collapsed ? '12px 0' : '12px 16px',
                                cursor: 'pointer',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                color: 'rgba(255,255,255,0.65)',
                            }}
                            aria-label="Выйти"
                        >
                            <LogoutIcon size={18} />
                            {!collapsed && (
                                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
                                    Выйти
                                </span>
                            )}
                        </div>
                    </div>
                </div>
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