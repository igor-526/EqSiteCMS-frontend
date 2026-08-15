"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { API_STATUS, isApiError, isApiSuccess } from "@/lib/apiStatus";
import { KNOWN_USER_SCOPES, User } from "@/types/api/user";
import { getUserInfo } from "@/api/user";
import { usePathname } from "next/navigation";

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  scopes: KNOWN_USER_SCOPES[];
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [scopes, setScopes] = useState<KNOWN_USER_SCOPES[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const shouldFetchRef = useRef(true);

  const clearUser = useCallback(() => {
    setUser(null);
    setScopes([]);
    setError(null);
    hasFetchedRef.current = false;
    isFetchingRef.current = false;
    shouldFetchRef.current = false;
  }, []);

  const fetchUser = useCallback(
    async (force = false) => {
      // Don't fetch on login page (unless forced)
      if (pathname?.startsWith("/login") && !force) {
        setLoading(false);
        return;
      }

      // Skip if auto-fetch is disabled and not forced
      if (!shouldFetchRef.current && !force) {
        return;
      }

      // Prevent parallel requests
      if (isFetchingRef.current && !force) {
        return;
      }

      try {
        isFetchingRef.current = true;
        setLoading(true);
        setError(null);
        const result = await getUserInfo();
        if (isApiSuccess(result) && result.data) {
          setUser(result.data);
          setScopes(result.data.scopes.map((scope) => scope.scope_name));
          hasFetchedRef.current = true;
          shouldFetchRef.current = true;
        } else {
          setError("Не удалось загрузить информацию о пользователе");
          setUser(null);
          setScopes([]);
          hasFetchedRef.current = false;
          shouldFetchRef.current = false;
        }
      } catch {
        setError("Ошибка при загрузке информации о пользователе");
        setUser(null);
        setScopes([]);
        hasFetchedRef.current = false;
        shouldFetchRef.current = false;
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [pathname],
  );

  // Load user info once on mount (except on login page)
  useEffect(() => {
    if (pathname?.startsWith("/login")) {
      setLoading(false);
      return;
    }

    if (
      !hasFetchedRef.current &&
      shouldFetchRef.current &&
      !isFetchingRef.current
    ) {
      fetchUser();
    }
  }, []);

  const refreshUser = useCallback(async () => {
    shouldFetchRef.current = true;
    await fetchUser(true);
  }, [fetchUser]);

  return (
    <UserContext.Provider
      value={{ user, scopes, loading, error, refreshUser, clearUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
