import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { booksService } from "@/services/books";
import { SearchParams, AddBookToLibrary, UpdateProgress } from "@/types/books";

// Query Keys Factory - creates user-specific keys
export const createBooksQueryKeys = (userId?: string) => ({
  all: ["books"] as const,
  search: (params: SearchParams) => ["books", "search", params] as const,
  bookById: (id: string) => ["books", "book", id] as const,
  userBooks: {
    all: ["user-books", userId] as const,
    list: (params?: Record<string, unknown>) =>
      ["user-books", userId, "list", params] as const,
    stats: () => ["user-books", userId, "stats"] as const,
    detail: (bookId: string) =>
      ["user-books", userId, "detail", bookId] as const,
  },
});

// Legacy export for backward compatibility - but now user-aware
export const booksQueryKeys = createBooksQueryKeys();

// Search Books Query
export function useSearchBooks(params: SearchParams, enabled = true) {
  return useQuery({
    queryKey: booksQueryKeys.search(params),
    queryFn: () => booksService.searchBooks(params),
    enabled: enabled && !!params.query?.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get Book by ID Query
export function useBookById(id: string, enabled = true) {
  return useQuery({
    queryKey: booksQueryKeys.bookById(id),
    queryFn: () => booksService.getBookById(id),
    enabled: enabled && !!id,
  });
}

// Get User Library Query
export function useUserLibrary(params?: {
  status?: string;
  isFavorite?: boolean;
  page?: number;
  limit?: number;
}) {
  const { user } = useAuth();
  const queryKeys = createBooksQueryKeys(user?.id);

  return useQuery({
    queryKey: queryKeys.userBooks.list(params),
    queryFn: () => booksService.getUserLibrary(params),
    enabled: !!user, // Only run query if user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get Library Stats Query
export function useLibraryStats() {
  const { user } = useAuth();
  const queryKeys = createBooksQueryKeys(user?.id);

  return useQuery({
    queryKey: queryKeys.userBooks.stats(),
    queryFn: () => booksService.getLibraryStats(),
    enabled: !!user, // Only run query if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get User Book Query
export function useUserBook(bookId: string, enabled = true) {
  const { user } = useAuth();
  const queryKeys = createBooksQueryKeys(user?.id);

  return useQuery({
    queryKey: queryKeys.userBooks.detail(bookId),
    queryFn: () => booksService.getUserBook(bookId),
    enabled: enabled && !!bookId && !!user, // Only run query if user is authenticated
  });
}

// Add Book to Library Mutation
export function useAddBookToLibrary() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: AddBookToLibrary) => booksService.addBookToLibrary(data),
    onSuccess: (newBook) => {
      if (user) {
        const queryKeys = createBooksQueryKeys(user.id);

        // Invalidate and refetch user library queries
        queryClient.invalidateQueries({
          queryKey: queryKeys.userBooks.all,
        });

        // Optionally add the book to the cache
        queryClient.setQueryData(
          queryKeys.userBooks.detail(newBook.bookId),
          newBook
        );
      }
    },
    meta: {
      successMessage: "Book added to your library successfully!",
    },
  });
}

// Update Progress Mutation
export function useUpdateProgress() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ bookId, data }: { bookId: string; data: UpdateProgress }) =>
      booksService.updateProgress(bookId, data),
    onSuccess: (updatedBook, variables) => {
      if (user) {
        const queryKeys = createBooksQueryKeys(user.id);

        // Update the specific book in cache
        queryClient.setQueryData(
          queryKeys.userBooks.detail(variables.bookId),
          updatedBook
        );

        // Invalidate user library and stats
        queryClient.invalidateQueries({
          queryKey: queryKeys.userBooks.list(),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.userBooks.stats(),
        });
      }
    },
    meta: {
      successMessage: "Progress updated successfully!",
    },
  });
}

// Remove Book from Library Mutation
export function useRemoveBookFromLibrary() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (bookId: string) => booksService.removeBookFromLibrary(bookId),
    onSuccess: (result, bookId) => {
      if (user) {
        const queryKeys = createBooksQueryKeys(user.id);

        // Remove the book from cache
        queryClient.removeQueries({
          queryKey: queryKeys.userBooks.detail(bookId),
        });

        // Invalidate user library and stats
        queryClient.invalidateQueries({
          queryKey: queryKeys.userBooks.all,
        });
      }
    },
    meta: {
      successMessage: "Book removed from library successfully!",
    },
  });
}

// Custom hook for searching with debouncing
export function useDebouncedSearch(query: string, delay = 500) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return debouncedQuery;
}

// Books currently reading
export function useBooksCurrentlyReading() {
  return useUserLibrary({ status: "READING" });
}
