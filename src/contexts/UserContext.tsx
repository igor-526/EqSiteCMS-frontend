"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { KNOWN_USER_SCOPES, User } from '@/types/api/user';
import { getUserInfo } from '@/api/user';
import { usePathname, useRouter } from 'next/navigation';

interface UserContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    scopes: KNOWN_USER_SCOPES[];
    refreshUser: () => Promise<void>;
    clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [scopes, setScopes] = useState<KNOWN_USER_SCOPES[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const hasFetchedRef = useRef(false);
    const isFetchingRef = useRef(false);
    const shouldFetchRef = useRef(true); // Флаг для контроля автоматических запросов

    const clearUser = useCallback(() => {
        setUser(null);
        setScopes([]);
        setError(null);
        hasFetchedRef.current = false;
        isFetchingRef.current = false;
        shouldFetchRef.current = false; // Отключаем автоматические запросы после выхода
    }, []);

    const fetchUser = useCallback(async (force = false) => {
        // Не делаем запросы на странице логина (кроме принудительного обновления)
        if (pathname?.startsWith('/login') && !force) {
            setLoading(false);
            return;
        }

        // Если автоматические запросы отключены и это не принудительный запрос
        if (!shouldFetchRef.current && !force) {
            return;
        }

        // Предотвращаем параллельные запросы
        if (isFetchingRef.current && !force) {
            return;
        }

        try {
            isFetchingRef.current = true;
            setLoading(true);
            setError(null);
            const result = await getUserInfo();
            if (result.status === "ok" && result.data) {
                setUser(result.data);
                setScopes(result.data.scopes.map(scope => scope.scope_name));
                hasFetchedRef.current = true;
                shouldFetchRef.current = true; // Включаем автоматические запросы после успешной загрузки
            } else {
                setError("Не удалось загрузить информацию о пользователе");
                // Очищаем данные пользователя при ошибке авторизации
                setUser(null);
                setScopes([]);
                hasFetchedRef.current = false;
                shouldFetchRef.current = false;
                // Если пользователь не авторизован, перенаправляем на страницу входа
                if (pathname && !pathname.startsWith('/login')) {
                    router.push('/login');
                }
            }
        } catch (err) {
            setError("Ошибка при загрузке информации о пользователе");
            // Очищаем данные пользователя при ошибке
            setUser(null);
            setScopes([]);
            hasFetchedRef.current = false;
            shouldFetchRef.current = false;
            if (pathname && !pathname.startsWith('/login')) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [pathname, router]);

    // Загружаем информацию о пользователе только один раз при монтировании (если не на странице логина)
    useEffect(() => {
        if (pathname?.startsWith('/login')) {
            setLoading(false);
            return;
        }

        // Загружаем только если еще не загружали и автоматические запросы включены
        if (!hasFetchedRef.current && shouldFetchRef.current && !isFetchingRef.current) {
            fetchUser();
        }
    }, []); // Пустой массив зависимостей - выполняется только при монтировании

    const refreshUser = useCallback(async () => {
        shouldFetchRef.current = true; // Включаем автоматические запросы перед принудительным обновлением
        await fetchUser(true);
    }, [fetchUser]);

    return (
        <UserContext.Provider value={{ user, scopes, loading, error, refreshUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};
