"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  useBooksCurrentlyReading,
  useUpdateProgress,
  booksQueryKeys,
} from "@/hooks/useBooks";
import { UserBook } from "@/types/books";
import { Dictionary } from "@/lib/dictionaries";
import { interpolate } from "@/lib/helpers";

interface CurrentlyReadingContextValue {
  // State
  currentIndex: number;
  selectedBookForUpdate: UserBook | null;
  selectedBookForDetails: UserBook | null;
  dictionary?: Dictionary;
  pendingChanges: { [key: string]: number };

  // Derived state
  books: UserBook[];
  loading: boolean;
  itemsPerPage: number;
  totalPages: number;
  canGoBack: boolean;
  canGoForward: boolean;
  currentBooks: UserBook[];

  // Actions
  setCurrentIndex: (index: number) => void;
  setSelectedBookForUpdate: (book: UserBook | null) => void;
  setSelectedBookForDetails: (book: UserBook | null) => void;
  handlePrevious: () => void;
  handleNext: () => void;
  handleOpenProgressModal: (userBook: UserBook) => void;
  handleCloseProgressModal: () => void;
  handleOpenDetailsModal: (userBook: UserBook) => void;
  handleCloseDetailsModal: () => void;
  handleQuickProgressUpdate: (
    userBook: UserBook,
    increment: number
  ) => Promise<void>;
  handleProgressUpdate: (newPage: number) => Promise<void>;
}

const CurrentlyReadingContext = createContext<
  CurrentlyReadingContextValue | undefined
>(undefined);

export function useCurrentlyReading() {
  const context = useContext(CurrentlyReadingContext);
  if (context === undefined) {
    throw new Error(
      "useCurrentlyReading must be used within a CurrentlyReadingProvider"
    );
  }
  return context;
}

interface CurrentlyReadingProviderProps {
  children: React.ReactNode;
  dictionary?: Dictionary;
}

export function CurrentlyReadingProvider({
  children,
  dictionary,
}: CurrentlyReadingProviderProps) {
  const { data: libraryResponse, isLoading: loading } =
    useBooksCurrentlyReading();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBookForUpdate, setSelectedBookForUpdate] =
    useState<UserBook | null>(null);
  const [selectedBookForDetails, setSelectedBookForDetails] =
    useState<UserBook | null>(null);

  // State to track pending UI changes for immediate feedback
  const [pendingChanges, setPendingChanges] = useState<{
    [key: string]: number;
  }>({});
  const updateProgressMutation = useUpdateProgress();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Memoize raw books to prevent dependency issues
  const rawBooks = useMemo(
    () => libraryResponse?.books || [],
    [libraryResponse?.books]
  );

  // Apply pending changes to books for immediate UI feedback
  const books = rawBooks.map((book) => {
    const pendingChange = pendingChanges[book.id] || 0;
    if (pendingChange === 0) return book;

    const newCurrentPage = Math.max(
      0,
      Math.min(book.book.totalPages, book.currentPage + pendingChange)
    );
    const newProgressPercentage = Math.round(
      (newCurrentPage / book.book.totalPages) * 100
    );

    return {
      ...book,
      currentPage: newCurrentPage,
      progressPercentage: newProgressPercentage,
    };
  });

  const itemsPerPage = 4;
  const totalPages = Math.ceil(books.length / itemsPerPage);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < totalPages - 1;

  const currentBooks = books.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const handlePrevious = () => {
    if (canGoBack) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleOpenProgressModal = (userBook: UserBook) => {
    setSelectedBookForUpdate(userBook);
  };

  const handleCloseProgressModal = () => {
    setSelectedBookForUpdate(null);
  };

  const handleOpenDetailsModal = (userBook: UserBook) => {
    setSelectedBookForDetails(userBook);
  };

  const handleCloseDetailsModal = () => {
    setSelectedBookForDetails(null);
  };

  const updateBookProgress = useCallback(
    async (userBook: UserBook, newPage: number): Promise<void> => {
      const clampedPage = Math.max(
        0,
        Math.min(newPage, userBook.book.totalPages)
      );
      const newProgressPercentage = Math.round(
        (clampedPage / userBook.book.totalPages) * 100
      );

      // Optimistic update - immediately update the UI
      const previousReadingData = queryClient.getQueryData(
        booksQueryKeys.userBooks.list({ status: "READING" })
      );
      const previousMainData = queryClient.getQueryData(
        booksQueryKeys.userBooks.list()
      );

      // Update Currently Reading cache
      queryClient.setQueryData(
        booksQueryKeys.userBooks.list({ status: "READING" }),
        (oldData: unknown) => {
          if (!oldData || typeof oldData !== "object" || !("books" in oldData))
            return oldData;
          const data = oldData as { books: UserBook[] };

          return {
            ...data,
            books: data.books.map((book: UserBook) =>
              book.id === userBook.id
                ? {
                    ...book,
                    currentPage: clampedPage,
                    progressPercentage: newProgressPercentage,
                  }
                : book
            ),
          };
        }
      );

      // Update main library cache
      queryClient.setQueryData(
        booksQueryKeys.userBooks.list(),
        (oldData: unknown) => {
          if (!oldData || typeof oldData !== "object" || !("books" in oldData))
            return oldData;
          const data = oldData as { books: UserBook[] };

          return {
            ...data,
            books: data.books.map((book: UserBook) =>
              book.id === userBook.id
                ? {
                    ...book,
                    currentPage: clampedPage,
                    progressPercentage: newProgressPercentage,
                  }
                : book
            ),
          };
        }
      );

      try {
        await updateProgressMutation.mutateAsync({
          bookId: userBook.bookId,
          data: { currentPage: clampedPage },
        });

        const message = dictionary
          ? interpolate(dictionary.library.progressUpdated, {
              page: clampedPage,
            })
          : `Progress updated to page ${clampedPage}`;
        toast(message);
      } catch (error) {
        // Revert optimistic updates on error
        queryClient.setQueryData(
          booksQueryKeys.userBooks.list({ status: "READING" }),
          previousReadingData
        );
        queryClient.setQueryData(
          booksQueryKeys.userBooks.list(),
          previousMainData
        );

        console.error("Failed to update progress:", error);
        const errorMessage = dictionary
          ? dictionary.library.progressFailed
          : "Failed to update progress. Please try again.";
        toast(errorMessage);
        throw error;
      }
    },
    [queryClient, updateProgressMutation, dictionary, toast]
  );

  // Debounce refs for accumulating progress updates
  const debounceRefs = useRef<{
    [key: string]: { timeout: NodeJS.Timeout; accumulatedChange: number };
  }>({});

  const handleQuickProgressUpdate = useCallback(
    async (userBook: UserBook, increment: number): Promise<void> => {
      // Clear existing timeout for this book
      if (debounceRefs.current[userBook.id]) {
        clearTimeout(debounceRefs.current[userBook.id].timeout);
      }

      // Initialize or update accumulated change
      const existingAccumulated =
        debounceRefs.current[userBook.id]?.accumulatedChange || 0;
      const totalChange = existingAccumulated + increment;

      // Immediately update UI state for visual feedback
      setPendingChanges((prev) => ({
        ...prev,
        [userBook.id]: totalChange,
      }));

      // Calculate the final page for database update
      const originalBook = rawBooks.find((book) => book.id === userBook.id);
      if (!originalBook) return;

      const newPage = Math.max(
        0,
        Math.min(
          originalBook.book.totalPages,
          originalBook.currentPage + totalChange
        )
      );

      // Set new timeout for database update
      debounceRefs.current[userBook.id] = {
        accumulatedChange: totalChange,
        timeout: setTimeout(async () => {
          try {
            await updateBookProgress(originalBook, newPage);
            // Clear both debounce entry and pending changes after successful update
            delete debounceRefs.current[userBook.id];
            setPendingChanges((prev) => {
              const newState = { ...prev };
              delete newState[userBook.id];
              return newState;
            });
          } catch (error) {
            // Clear debounce entry and revert pending changes on error
            delete debounceRefs.current[userBook.id];
            setPendingChanges((prev) => {
              const newState = { ...prev };
              delete newState[userBook.id];
              return newState;
            });
            throw error;
          }
        }, 800), // 800ms debounce delay
      };
    },
    [updateBookProgress, setPendingChanges, rawBooks]
  );

  const handleProgressUpdate = async (newPage: number): Promise<void> => {
    if (!selectedBookForUpdate) return;
    await updateBookProgress(selectedBookForUpdate, newPage);
    handleCloseProgressModal();
  };

  const value: CurrentlyReadingContextValue = {
    // State
    currentIndex,
    selectedBookForUpdate,
    selectedBookForDetails,
    dictionary,
    pendingChanges,

    // Derived state
    books,
    loading,
    itemsPerPage,
    totalPages,
    canGoBack,
    canGoForward,
    currentBooks,

    // Actions
    setCurrentIndex,
    setSelectedBookForUpdate,
    setSelectedBookForDetails,
    handlePrevious,
    handleNext,
    handleOpenProgressModal,
    handleCloseProgressModal,
    handleOpenDetailsModal,
    handleCloseDetailsModal,
    handleQuickProgressUpdate,
    handleProgressUpdate,
  };

  return (
    <CurrentlyReadingContext.Provider value={value}>
      {children}
    </CurrentlyReadingContext.Provider>
  );
}
