"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createLocalePath } from "@/lib/helpers";

interface UseAuthRedirectOptions {
  redirectTo?: "login" | "dashboard";
  requireAuth?: boolean;
  redirectPath?: string;
}

/**
 * Custom hook for handling authentication-based redirects
 *
 * @param options Configuration for redirect behavior
 * @param options.redirectTo Where to redirect ('login' or 'dashboard')
 * @param options.requireAuth Whether authentication is required for this route
 * @param options.redirectPath Custom redirect path after login
 */
export function useAuthRedirect({
  redirectTo,
  requireAuth = true,
  redirectPath,
}: UseAuthRedirectOptions = {}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const currentPath = window.location.pathname;

    if (requireAuth && !isAuthenticated) {
      const loginPath = createLocalePath("login");
      const redirectParam = redirectPath || currentPath;
      router.push(`${loginPath}?redirect=${encodeURIComponent(redirectParam)}`);
      return;
    }

    if (!requireAuth && isAuthenticated) {
      const dashboardPath = createLocalePath("dashboard");
      router.push(dashboardPath);
      return;
    }

    if (redirectTo && !isLoading) {
      if (redirectTo === "login" && !isAuthenticated) {
        const loginPath = createLocalePath("login");
        router.push(loginPath);
      } else if (redirectTo === "dashboard" && isAuthenticated) {
        const dashboardPath = createLocalePath("dashboard");
        router.push(dashboardPath);
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    requireAuth,
    redirectTo,
    redirectPath,
    router,
  ]);

  return { isAuthenticated, isLoading };
}
