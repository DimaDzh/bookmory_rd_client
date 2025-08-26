"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Plus, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSearchBooks, useAddBookToLibrary } from "@/hooks/useBooks";
import { Book } from "@/types/books";

interface BookSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookSearchModal({
  isOpen,
  onClose,
}: BookSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const { toast } = useToast();

  const {
    data: searchResults,
    isLoading: isSearching,
    refetch: searchBooks,
  } = useSearchBooks({ query: searchQuery }, false);

  const addBookMutation = useAddBookToLibrary();

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
        `Book added! "${book.volumeInfo.title}" has been added to your library.`
      );

      // Clear search and close modal
      setSearchQuery("");
      setSelectedBook(null);
      onClose();
    } catch (error) {
      console.error("Error adding book:", error);
      toast("Error: Failed to add book to library. Please try again.");
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

  const books = searchResults?.items || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {selectedBook ? "Book Details" : "Search Books"}
          </DialogTitle>
          <DialogDescription>
            {selectedBook
              ? "Review book details and confirm to add to your library"
              : "Search for books and add them to your reading list"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {selectedBook ? (
            // Book Details View
            <BookDetailsView
              book={selectedBook}
              onConfirm={() => handleAddBook(selectedBook)}
              onDecline={handleDecline}
              isAdding={addBookMutation.isPending}
            />
          ) : (
            // Search View
            <>
              {/* Search Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter book title, author, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Search Results */}
              <div className="max-h-[500px] overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-muted-foreground">
                        Searching books...
                      </p>
                    </div>
                  </div>
                ) : books.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {books.map((book: Book) => (
                      <SimpleBookCard
                        key={book.id}
                        book={book}
                        onSelect={() => handleBookSelect(book)}
                      />
                    ))}
                  </div>
                ) : searchQuery && !isSearching ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No books found</h3>
                    <p>Try adjusting your search terms.</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Search for books</h3>
                    <p>
                      Enter a book title, author, or keyword to get started.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple Book Card Component - shows cover and title only
interface SimpleBookCardProps {
  book: Book;
  onSelect: () => void;
}

function SimpleBookCard({ book, onSelect }: SimpleBookCardProps) {
  const { volumeInfo } = book;
  const thumbnail =
    volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="text-center">
          {/* Book Cover */}
          <div className="mb-3">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={volumeInfo.title}
                width={120}
                height={180}
                className="rounded-md object-cover mx-auto"
                unoptimized
              />
            ) : (
              <div className="w-30 h-45 bg-muted rounded-md flex items-center justify-center mx-auto">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Book Title */}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">
            {volumeInfo.title}
          </h3>

          {/* Author */}
          {volumeInfo.authors && volumeInfo.authors[0] && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              by {volumeInfo.authors[0]}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Book Details View Component - shows detailed information with confirm/decline
interface BookDetailsViewProps {
  book: Book;
  onConfirm: () => void;
  onDecline: () => void;
  isAdding: boolean;
}

function BookDetailsView({
  book,
  onConfirm,
  onDecline,
  isAdding,
}: BookDetailsViewProps) {
  const { volumeInfo } = book;
  const thumbnail =
    volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={volumeInfo.title}
              width={160}
              height={240}
              className="rounded-md object-cover"
              unoptimized
            />
          ) : (
            <div className="w-40 h-60 bg-muted rounded-md flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Book Information */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{volumeInfo.title}</h2>
            {volumeInfo.authors && (
              <p className="text-lg text-muted-foreground">
                by {volumeInfo.authors.join(", ")}
              </p>
            )}
          </div>

          {/* Book Metadata */}
          <div className="flex flex-wrap gap-2">
            {volumeInfo.publishedDate && (
              <Badge variant="secondary">
                Published: {new Date(volumeInfo.publishedDate).getFullYear()}
              </Badge>
            )}
            {volumeInfo.pageCount && (
              <Badge variant="secondary">{volumeInfo.pageCount} pages</Badge>
            )}
            {volumeInfo.publisher && (
              <Badge variant="secondary">{volumeInfo.publisher}</Badge>
            )}
            {volumeInfo.categories && volumeInfo.categories[0] && (
              <Badge variant="secondary">{volumeInfo.categories[0]}</Badge>
            )}
            {volumeInfo.language && (
              <Badge variant="secondary">
                Language: {volumeInfo.language.toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Description */}
          {volumeInfo.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-h-40 overflow-y-auto">
                {volumeInfo.description.replace(/<[^>]*>/g, "")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onDecline} disabled={isAdding}>
          Decline
        </Button>
        <Button onClick={onConfirm} disabled={isAdding}>
          {isAdding ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding to Library...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add to Library
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
