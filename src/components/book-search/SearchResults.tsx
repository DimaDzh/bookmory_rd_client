"use client";

import { Search, BookOpen } from "lucide-react";
import { useBookSearch } from "@/contexts/BookSearchContext";
import { BookCard } from "./BookCard";

export function SearchResults() {
  const { dictionary, isSearching, books, searchQuery } = useBookSearch();

  if (isSearching) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">
            {dictionary.bookSearch.searchingBooks}
          </p>
        </div>
      </div>
    );
  }

  if (books.length > 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    );
  }

  if (searchQuery && !isSearching) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4" />
        <h3 className="font-medium mb-2">
          {dictionary.bookSearch.noResultsTitle}
        </h3>
        <p>{dictionary.bookSearch.noResultsDescription}</p>
      </div>
    );
  }

  return (
    <div className="text-center py-8 text-muted-foreground">
      <Search className="h-12 w-12 mx-auto mb-4" />
      <h3 className="font-medium mb-2">
        {dictionary.bookSearch.searchPromptTitle}
      </h3>
      <p>{dictionary.bookSearch.searchPromptDescription}</p>
    </div>
  );
}
