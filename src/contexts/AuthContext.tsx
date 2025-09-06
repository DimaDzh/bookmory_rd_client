"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, LoginRequest, RegisterRequest } from "@/types/auth";
import { authApi } from "@/services/auth";
import { createLocalePath } from "@/lib/helpers";
import cookieManager from "@/lib/cookies";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  const isAuthenticated = !!user;

  useEffect(() => {
    const checkAuth = async () => {
      const token = cookieManager.get("auth_token");
      console.log("Checking auth, token:", token ? "exists" : "not found");

      if (token) {
        try {
          const userData = await authApi.getProfile();
          setUser(userData);
          console.log("Auth check successful, user:", userData.email);
        } catch (error) {
          console.error("Failed to get user profile:", error);
          cookieManager.remove("auth_token");
          // Clear cached data if authentication fails
          queryClient.clear();
          setUser(null);

          // Redirect to login if token is invalid and we're on a protected route
          const currentPath = window.location.pathname;
          const protectedRoutes = ["/dashboard", "/library", "/profile"];
          const isProtectedRoute = protectedRoutes.some((route) =>
            currentPath.includes(route)
          );

          if (isProtectedRoute) {
            const loginPath = createLocalePath("login");
            router.push(
              `${loginPath}?redirect=${encodeURIComponent(currentPath)}`
            );
          }
        }
      } else {
        console.log("No token found, clearing user data");
        // Clear cached data if no token exists
        queryClient.clear();
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Add event listeners for visibility and focus changes to re-check auth
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuth();
      }
    };

    const handleFocus = () => {
      checkAuth();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // Cleanup event listeners
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [queryClient, router]);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);

      // Store token with enhanced persistence
      cookieManager.set("auth_token", response.access_token);

      // Clear all cached data before setting new user
      queryClient.clear();

      setUser(response.user);
      toast.success("Login successful!");

      // Check if there's a redirect parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get("redirect");

      if (redirectPath) {
        // Navigate to the original intended page
        router.push(redirectPath);
      } else {
        // Navigate to dashboard with current locale
        const dashboardPath = createLocalePath("dashboard");
        router.push(dashboardPath);
      }
    } catch (error: unknown) {
      const apiError = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const errorMessage = apiError.response?.data?.message || "Login failed";
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(userData);

      // Store token with enhanced persistence
      cookieManager.set("auth_token", response.access_token);

      // Clear all cached data before setting new user
      queryClient.clear();

      setUser(response.user);
      toast.success("Registration successful!");

      // Navigate to dashboard with current locale
      const dashboardPath = createLocalePath("dashboard");
      router.push(dashboardPath);
    } catch (error: unknown) {
      const apiError = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const errorMessage =
        apiError.response?.data?.message || "Registration failed";
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Remove cookie with proper cleanup
    cookieManager.remove("auth_token");

    // Clear all cached data when user logs out
    queryClient.clear();

    setUser(null);
    toast.success("Logged out successfully");

    // Navigate to login with current locale
    const loginPath = createLocalePath("login");
    router.push(loginPath);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
