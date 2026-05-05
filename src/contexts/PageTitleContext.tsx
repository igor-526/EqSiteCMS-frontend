"use client";

import React, { createContext, useContext, useState } from 'react';

interface PageTitleContextType {
    pageTitle: string;
    setPageTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined);

export const PageTitleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pageTitle, setPageTitle] = useState<string>('Страница');

    return (
        <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
            {children}
        </PageTitleContext.Provider>
    );
};

export const usePageTitleContext = () => {
    const context = useContext(PageTitleContext);
    if (context === undefined) {
        throw new Error('usePageTitleContext must be used within a PageTitleProvider');
    }
    return context;
};
