"use client";

import React, { createContext, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchBooks, useAddBookToLibrary } from "@/hooks/useBooks";
import { Book, BooksSearchResponse } from "@/types/books";
import { Dictionary } from "@/lib/dictionaries";
import { interpolate } from "@/lib/helpers";

interface BookSearchContextValue {
  // State
  searchQuery: string;
  selectedBook: Book | null;
  dictionary: Dictionary;

  // Derived state
  searchResults: BooksSearchResponse | undefined;
  isSearching: boolean;
  isAdding: boolean;
  books: Book[];

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedBook: (book: Book | null) => void;
  handleSearch: () => void;
  handleAddBook: (book: Book) => Promise<void>;
  handleBookSelect: (book: Book) => void;
  handleDecline: () => void;
  handleClose: () => void;
}

const BookSearchContext = createContext<BookSearchContextValue | undefined>(
  undefined
);

export function useBookSearch() {
  const context = useContext(BookSearchContext);
  if (context === undefined) {
    throw new Error("useBookSearch must be used within a BookSearchProvider");
  }
  return context;
}

interface BookSearchProviderProps {
  children: React.ReactNode;
  dictionary: Dictionary;
  onClose: () => void;
}

export function BookSearchProvider({
  children,
  dictionary,
  onClose,
}: BookSearchProviderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const { toast } = useToast();

  const {
    data: searchResults,
    isLoading: isSearching,
    refetch: searchBooks,
  } = useSearchBooks({ query: searchQuery }, false);

  const addBookMutation = useAddBookToLibrary();

  const books = searchResults?.items || [];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchBooks();
    }
  };

  const handleAddBook = async (book: Book) => {
    try {
      await addBookMutation.mutateAsync({
        bookId: book.id,
        status: "WANT_TO_READ",
      });

      toast(
        interpolate(dictionary.bookSearch.bookAddedSuccess, {
          title: book.volumeInfo.title,
        })
      );

      // Clear search and close modal
      setSearchQuery("");
      setSelectedBook(null);
      onClose();
    } catch (error) {
      console.error("Error adding book:", error);
      toast(dictionary.bookSearch.bookAddedError);
    }
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
  };

  const handleDecline = () => {
    setSelectedBook(null);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedBook(null);
    onClose();
  };

  const value: BookSearchContextValue = {
    // State
    searchQuery,
    selectedBook,
    dictionary,

    // Derived state
    searchResults,
    isSearching,
    isAdding: addBookMutation.isPending,
    books,

    // Actions
    setSearchQuery,
    setSelectedBook,
    handleSearch,
    handleAddBook,
    handleBookSelect,
    handleDecline,
    handleClose,
  };

  return (
    <BookSearchContext.Provider value={value}>
      {children}
    </BookSearchContext.Provider>
  );
}
