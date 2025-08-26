"use client";

import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
  QueryCache,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type QueryError = {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
};

type MutationMeta = {
  successMessage?: string;
};

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            retry: (failureCount, error: unknown) => {
              const queryError = error as QueryError;
              // Don't retry on 4xx errors
              if (
                queryError?.response?.status &&
                queryError.response.status >= 400 &&
                queryError.response.status < 500
              ) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: false,
          },
        },
        queryCache: new QueryCache({
          onError: (error: unknown) => {
            // Global error handling for queries
            console.error("Query error:", error);
            const queryError = error as QueryError;
            if (queryError?.response?.status === 401) {
              // Handle unauthorized errors globally
              toast.error("Session expired. Please login again.");
              // You might want to redirect to login here
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: unknown) => {
            // Global error handling for mutations
            console.error("Mutation error:", error);
            const mutationError = error as QueryError;
            const errorMessage =
              mutationError?.response?.data?.message ||
              mutationError?.message ||
              "An error occurred";
            toast.error(errorMessage);
          },
          onSuccess: (
            data: unknown,
            variables: unknown,
            context: unknown,
            mutation
          ) => {
            // Global success handling for mutations
            const meta = mutation.options.meta as MutationMeta | undefined;
            if (meta?.successMessage) {
              toast.success(meta.successMessage);
            }
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
