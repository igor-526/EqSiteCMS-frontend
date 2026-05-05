import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React from "react";
import {ConfigProvider} from "antd";
import ru_RU from 'antd/lib/locale/ru_RU';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { UserProvider } from '@/contexts/UserContext';
import { PageTitleProvider } from '@/contexts/PageTitleContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Equestrian App',
    description: 'Horse management application',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <ConfigProvider locale={ru_RU}>
            <html lang="ru">
                <body className={inter.className}>
                    <NotificationProvider>
                        <UserProvider>
                            <PageTitleProvider>
                                {children}
                            </PageTitleProvider>
                        </UserProvider>
                    </NotificationProvider>
                </body>
            </html>
        </ConfigProvider>

    );
}