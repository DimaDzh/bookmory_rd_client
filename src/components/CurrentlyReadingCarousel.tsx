"use client";

import Image from "next/image";
import {
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useBooksCurrentlyReading,
  useUpdateProgress,
  booksQueryKeys,
} from "@/hooks/useBooks";
import { useQueryClient } from "@tanstack/react-query";
import { UserBook } from "@/types/books";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CurrentlyReadingCarouselProps {
  className?: string;
}

export function CurrentlyReadingCarousel({
  className = "",
}: CurrentlyReadingCarouselProps) {
  const { data: libraryResponse, isLoading: loading } =
    useBooksCurrentlyReading();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBookForUpdate, setSelectedBookForUpdate] =
    useState<UserBook | null>(null);
  const updateProgressMutation = useUpdateProgress();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const books = libraryResponse?.books || [];
  const itemsPerPage = 4; // Show 4 books at a time
  const totalPages = Math.ceil(books.length / itemsPerPage);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < totalPages - 1;

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

  const currentBooks = books.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const handleOpenProgressModal = (userBook: UserBook) => {
    setSelectedBookForUpdate(userBook);
  };

  const handleCloseProgressModal = () => {
    setSelectedBookForUpdate(null);
  };

  const handleQuickProgressUpdate = async (
    userBook: UserBook,
    increment: number
  ) => {
    const newPage = Math.max(
      0,
      Math.min(userBook.currentPage + increment, userBook.book.totalPages)
    );

    // Calculate new progress percentage
    const newProgressPercentage = Math.round(
      (newPage / userBook.book.totalPages) * 100
    );

    // Optimistic update - immediately update the UI
    const previousData = queryClient.getQueryData(
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
                  currentPage: newPage,
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
                  currentPage: newPage,
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
        data: { currentPage: newPage },
      });
      toast(`Progress updated to page ${newPage}`);
    } catch (error) {
      // Revert optimistic updates on error
      queryClient.setQueryData(
        booksQueryKeys.userBooks.list({ status: "READING" }),
        previousData
      );
      queryClient.setQueryData(
        booksQueryKeys.userBooks.list(),
        previousMainData
      );

      console.error("Failed to update progress:", error);
      toast("Failed to update progress. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">Currently Reading</h3>
          <p className="text-sm text-muted-foreground">
            Your active reading list
          </p>
        </div>
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-1">
              <Card className="h-48 animate-pulse">
                <CardContent className="p-3 h-full flex flex-col">
                  <div className="w-full h-20 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded mb-1" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">Currently Reading</h3>
          <p className="text-sm text-muted-foreground">
            Your active reading list
          </p>
        </div>
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4" />
            <h4 className="font-medium mb-2">No books currently reading</h4>
            <p className="text-sm">Start reading a book to see it here.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Currently Reading</h3>
          <p className="text-sm text-muted-foreground">
            {books.length} book{books.length !== 1 ? "s" : ""} in progress
          </p>
        </div>

        {totalPages > 1 && (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={!canGoBack}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={!canGoForward}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {currentBooks.map((userBook: UserBook) => (
          <CompactReadingBookCard
            key={userBook.id}
            userBook={userBook}
            onOpenProgressModal={handleOpenProgressModal}
            onQuickUpdate={handleQuickProgressUpdate}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-1">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : "bg-muted"
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Update Modal */}
      {selectedBookForUpdate && (
        <ProgressUpdateModal
          book={selectedBookForUpdate}
          onClose={handleCloseProgressModal}
          onUpdate={async (newPage) => {
            // Calculate new progress percentage
            const newProgressPercentage = Math.round(
              (newPage / selectedBookForUpdate.book.totalPages) * 100
            );

            // Optimistic update - immediately update the UI
            const previousData = queryClient.getQueryData(
              booksQueryKeys.userBooks.list({ status: "READING" })
            );
            const previousMainData = queryClient.getQueryData(
              booksQueryKeys.userBooks.list()
            );

            // Update Currently Reading cache
            queryClient.setQueryData(
              booksQueryKeys.userBooks.list({ status: "READING" }),
              (oldData: unknown) => {
                if (
                  !oldData ||
                  typeof oldData !== "object" ||
                  !("books" in oldData)
                )
                  return oldData;
                const data = oldData as { books: UserBook[] };

                return {
                  ...data,
                  books: data.books.map((book: UserBook) =>
                    book.id === selectedBookForUpdate.id
                      ? {
                          ...book,
                          currentPage: newPage,
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
                if (
                  !oldData ||
                  typeof oldData !== "object" ||
                  !("books" in oldData)
                )
                  return oldData;
                const data = oldData as { books: UserBook[] };

                return {
                  ...data,
                  books: data.books.map((book: UserBook) =>
                    book.id === selectedBookForUpdate.id
                      ? {
                          ...book,
                          currentPage: newPage,
                          progressPercentage: newProgressPercentage,
                        }
                      : book
                  ),
                };
              }
            );

            try {
              await updateProgressMutation.mutateAsync({
                bookId: selectedBookForUpdate.bookId,
                data: { currentPage: newPage },
              });
              toast(`Progress updated to page ${newPage}`);
              handleCloseProgressModal();
            } catch (error) {
              // Revert optimistic updates on error
              queryClient.setQueryData(
                booksQueryKeys.userBooks.list({ status: "READING" }),
                previousData
              );
              queryClient.setQueryData(
                booksQueryKeys.userBooks.list(),
                previousMainData
              );

              console.error("Failed to update progress:", error);
              toast("Failed to update progress. Please try again.");
            }
          }}
        />
      )}
    </div>
  );
}

interface CompactReadingBookCardProps {
  userBook: UserBook;
  onOpenProgressModal: (userBook: UserBook) => void;
  onQuickUpdate: (userBook: UserBook, increment: number) => Promise<void>;
}

function CompactReadingBookCard({
  userBook,
  onOpenProgressModal,
  onQuickUpdate,
}: CompactReadingBookCardProps) {
  const { book, currentPage, progressPercentage, startedAt } = userBook;

  const handleCardClick = () => {
    // You could add functionality here to open a reading detail modal or navigate to book details
    console.log(`Clicked on book: ${book.title}`);
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 group cursor-pointer hover:scale-[1.02]"
      onClick={handleCardClick}
    >
      <CardContent className="p-3 h-full flex flex-col">
        {/* Book Cover */}
        <div className="relative mb-3">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              width={80}
              height={120}
              className="object-cover rounded w-full h-20 mx-auto shadow-sm group-hover:shadow-md transition-shadow"
              unoptimized
            />
          ) : (
            <div className="w-full h-20 bg-muted rounded flex items-center justify-center shadow-sm">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <Badge
            variant="secondary"
            className="absolute -top-1 -right-1 text-xs px-1 py-0 bg-blue-100 text-blue-800"
          >
            Reading
          </Badge>
        </div>

        {/* Book Info */}
        <div className="flex-1 flex flex-col">
          <h4 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {book.title}
          </h4>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
            {book.author}
          </p>

          {/* Progress */}
          <div className="mt-auto">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">{progressPercentage}%</span>
              <span className="text-muted-foreground">
                {currentPage}/{book.totalPages}
              </span>
            </div>
            <div
              className="w-full bg-gray-200 rounded-full h-1.5 cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onOpenProgressModal(userBook);
              }}
            >
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Quick Update Buttons */}
            <div className="flex justify-between items-center mt-2">
              {startedAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Started {new Date(startedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickUpdate(userBook, -1);
                  }}
                  disabled={currentPage <= 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickUpdate(userBook, 1);
                  }}
                  disabled={currentPage >= book.totalPages}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProgressUpdateModalProps {
  book: UserBook;
  onClose: () => void;
  onUpdate: (newPage: number) => Promise<void>;
}

function ProgressUpdateModal({
  book,
  onClose,
  onUpdate,
}: ProgressUpdateModalProps) {
  const [newPage, setNewPage] = useState(book.currentPage.toString());
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(newPage) || 0;
    const clampedPage = Math.max(0, Math.min(pageNumber, book.book.totalPages));

    setIsUpdating(true);
    try {
      await onUpdate(clampedPage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setNewPage(book.currentPage.toString());
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Reading Progress</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="page">Current Page</Label>
            <div className="flex gap-2">
              <Input
                id="page"
                type="number"
                min="0"
                max={book.book.totalPages}
                value={newPage}
                onChange={(e) => setNewPage(e.target.value)}
                placeholder="Enter page number"
                className="flex-1"
              />
              <span className="flex items-center text-sm text-muted-foreground">
                / {book.book.totalPages}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating} className="flex-1">
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
