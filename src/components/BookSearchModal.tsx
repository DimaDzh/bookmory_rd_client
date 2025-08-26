"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, BookOpen, Users, Calendar, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { booksService } from "@/services/books";
import { Book, BooksSearchResponse } from "@/types/books";

interface BookSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BookSearchModal({
  open,
  onOpenChange,
}: BookSearchModalProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BooksSearchResponse | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSelectedBook(null);
    try {
      const searchResults = await booksService.searchBooks({
        query: query.trim(),
        maxResults: 10,
      });
      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      toast("Failed to search for books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
  };

  const handleConfirm = async () => {
    if (!selectedBook) return;

    setAdding(true);
    try {
      await booksService.addBookToLibrary({
        bookId: selectedBook.id,
        status: "WANT_TO_READ",
        isFavorite: false,
      });

      toast(
        `"${selectedBook.volumeInfo.title}" has been added to your library.`
      );
      handleClose();
    } catch (error: unknown) {
      console.error("Add book error:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to add book to library";
      toast(`Failed to add book: ${errorMessage}`);
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setQuery("");
    setResults(null);
    setSelectedBook(null);
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Books</DialogTitle>
          <DialogDescription>
            Search for books and add them to your library
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search Bar */}
          <div className="flex gap-2">
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

          <div className="flex gap-4 flex-1 min-h-0">
            {/* Search Results */}
            <div className="flex-1 overflow-auto">
              {results && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-medium">Search Results</h3>
                    <Badge variant="secondary">
                      {results.totalItems.toLocaleString()} books found
                    </Badge>
                  </div>

                  {results.items && results.items.length > 0 ? (
                    <div className="space-y-3">
                      {results.items.map((book) => (
                        <SimpleBookCard
                          key={book.id}
                          book={book}
                          selected={selectedBook?.id === book.id}
                          onClick={() => handleSelectBook(book)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-8 w-8 mx-auto mb-2" />
                      <p>
                        No books found for &quot;{query}&quot;. Try a different
                        search term.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Book Details */}
            {selectedBook && (
              <div className="w-80 border-l pl-4 overflow-auto">
                <BookDetails
                  book={selectedBook}
                  onConfirm={handleConfirm}
                  onDecline={() => setSelectedBook(null)}
                  adding={adding}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SimpleBookCardProps {
  book: Book;
  selected: boolean;
  onClick: () => void;
}

function SimpleBookCard({ book, selected, onClick }: SimpleBookCardProps) {
  const { volumeInfo } = book;
  const thumbnail =
    volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        selected ? "ring-2 ring-primary shadow-md" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex gap-3">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={volumeInfo.title}
              width={48}
              height={72}
              className="object-cover rounded flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-18 bg-muted rounded flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2 mb-1">
              {volumeInfo.title}
            </h4>
            {volumeInfo.authors && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                by {volumeInfo.authors.join(", ")}
              </p>
            )}
            {volumeInfo.publishedDate && (
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(volumeInfo.publishedDate).getFullYear()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BookDetailsProps {
  book: Book;
  onConfirm: () => void;
  onDecline: () => void;
  adding: boolean;
}

function BookDetails({ book, onConfirm, onDecline, adding }: BookDetailsProps) {
  const { volumeInfo } = book;
  const thumbnail =
    volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Book Details</h3>

      <div className="text-center">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={volumeInfo.title}
            width={120}
            height={180}
            className="object-cover rounded mx-auto"
          />
        ) : (
          <div className="w-30 h-45 bg-muted rounded flex items-center justify-center mx-auto">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm line-clamp-2">
            {volumeInfo.title}
          </h4>
        </div>

        {volumeInfo.authors && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">
              {volumeInfo.authors.join(", ")}
            </span>
          </div>
        )}

        {volumeInfo.publishedDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{volumeInfo.publishedDate}</span>
          </div>
        )}

        {volumeInfo.publisher && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{volumeInfo.publisher}</span>
          </div>
        )}

        {volumeInfo.pageCount && (
          <div className="text-sm text-muted-foreground">
            Pages: {volumeInfo.pageCount}
          </div>
        )}

        {volumeInfo.categories && volumeInfo.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {volumeInfo.categories.slice(0, 3).map((category, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        )}

        {volumeInfo.description && (
          <div>
            <h5 className="font-medium text-sm mb-1">Description</h5>
            <p className="text-xs text-muted-foreground line-clamp-6">
              {volumeInfo.description}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button
          onClick={onDecline}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Decline
        </Button>
        <Button
          onClick={onConfirm}
          size="sm"
          className="flex-1"
          disabled={adding}
        >
          {adding ? "Adding..." : "Confirm"}
        </Button>
      </div>
    </div>
  );
}
