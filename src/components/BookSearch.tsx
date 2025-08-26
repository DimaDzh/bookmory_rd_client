"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Plus, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { booksService } from "@/services/books";
import { Book, BooksSearchResponse } from "@/types/books";

export default function BookSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BooksSearchResponse | null>(null);
  const [addingBooks, setAddingBooks] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchResults = await booksService.searchBooks({
        query: query.trim(),
        maxResults: 20,
      });
      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      toast("Search Failed: Failed to search for books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (book: Book) => {
    setAddingBooks((prev) => new Set(prev).add(book.id));

    try {
      await booksService.addBookToLibrary({
        bookId: book.id,
        status: "WANT_TO_READ",
        isFavorite: false,
      });

      toast(
        `Book Added: "${book.volumeInfo.title}" has been added to your library.`
      );
    } catch (error: unknown) {
      console.error("Add book error:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to add book to library";
      toast(`Failed to Add Book: ${errorMessage}`);
    } finally {
      setAddingBooks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(book.id);
        return newSet;
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Books</h1>
        <p className="text-muted-foreground">
          Search for books and add them to your library
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="flex gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for books, authors, or topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Search Results</h2>
            <Badge variant="secondary">
              {results.totalItems.toLocaleString()} books found
            </Badge>
          </div>

          {results.items && results.items.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.items.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onAddBook={handleAddBook}
                  isAdding={addingBooks.has(book.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4" />
              <p>
                No books found for &quot;{query}&quot;. Try a different search
                term.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface BookCardProps {
  book: Book;
  onAddBook: (book: Book) => void;
  isAdding: boolean;
}

function BookCard({ book, onAddBook, isAdding }: BookCardProps) {
  const { volumeInfo } = book;
  const thumbnail =
    volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex gap-4">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={volumeInfo.title}
              width={64}
              height={96}
              className="object-cover rounded flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-24 bg-muted rounded flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-tight line-clamp-2 mb-1">
              {volumeInfo.title}
            </CardTitle>
            {volumeInfo.authors && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                {volumeInfo.authors.join(", ")}
              </p>
            )}
            {volumeInfo.publishedDate && (
              <p className="text-xs text-muted-foreground mt-1">
                Published: {new Date(volumeInfo.publishedDate).getFullYear()}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Book Details */}
        <div className="space-y-2 mb-4">
          {volumeInfo.publisher && (
            <p className="text-xs text-muted-foreground">
              {volumeInfo.publisher}
            </p>
          )}

          {volumeInfo.pageCount && (
            <p className="text-xs text-muted-foreground">
              {volumeInfo.pageCount} pages
            </p>
          )}

          {volumeInfo.categories && volumeInfo.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {volumeInfo.categories.slice(0, 2).map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {volumeInfo.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
            {volumeInfo.description}
          </p>
        )}

        {/* Add Button */}
        <Button
          onClick={() => onAddBook(book)}
          disabled={isAdding}
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isAdding ? "Adding..." : "Add to Library"}
        </Button>
      </CardContent>
    </Card>
  );
}
