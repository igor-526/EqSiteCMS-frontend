"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserContext } from "@/contexts/UserContext";

/**
 * Hook for auth guard - redirects to /login if user is not authenticated.
 * Use in layouts or pages that require authentication.
 */
export function useAuthGuard() {
  const { user, loading, error } = useUserContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check on login page
    if (pathname?.startsWith("/login")) {
      return;
    }

    // Redirect to login if not loading and no user
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
  };
}
