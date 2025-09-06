"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createLocalePath } from "@/lib/helpers";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  showLoader?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  showLoader = true,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        const currentPath = window.location.pathname;
        const loginPath = createLocalePath("login");
        router.push(`${loginPath}?redirect=${encodeURIComponent(currentPath)}`);
      } else if (!requireAuth && isAuthenticated) {
        const dashboardPath = createLocalePath("dashboard");
        router.push(dashboardPath);
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    if (!showLoader) return fallback || null;

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !isAuthenticated) {
    return fallback || null;
  }

  if (!requireAuth && isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}
