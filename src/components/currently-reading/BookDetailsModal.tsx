"use client";

import Image from "next/image";
import { BookOpen, Calendar, Clock, User, Hash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserBook } from "@/types/books";
import { useCurrentlyReading } from "@/contexts/CurrentlyReadingContext";

interface BookDetailsModalProps {
  userBook: UserBook | null;
  open: boolean;
  onClose: () => void;
}

export function BookDetailsModal({
  userBook,
  open,
  onClose,
}: BookDetailsModalProps) {
  const { dictionary, handleOpenProgressModal } = useCurrentlyReading();

  if (!userBook) return null;

  const { book, currentPage, progressPercentage, startedAt, status } = userBook;

  const handleUpdateProgress = () => {
    onClose();
    handleOpenProgressModal(userBook);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">
            {dictionary?.currentlyReading.bookDetails || "Book Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  width={160}
                  height={240}
                  className="rounded-md object-cover shadow-lg"
                  unoptimized
                />
              ) : (
                <div className="w-40 h-60 bg-muted rounded-md flex items-center justify-center shadow-lg">
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
                {book.author && (
                  <p className="text-lg text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {book.author}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {book.publishedDate && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Calendar className="h-3 w-3" />
                    {dictionary?.currentlyReading.published ||
                      "Published"}: {new Date(book.publishedDate).getFullYear()}
                  </Badge>
                )}
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {book.totalPages}{" "}
                  {dictionary?.currentlyReading.pages || "pages"}
                </Badge>
                {book.isbn && (
                  <Badge variant="secondary">ISBN: {book.isbn}</Badge>
                )}
                {book.language && (
                  <Badge variant="secondary">
                    {dictionary?.currentlyReading.language || "Language"}:{" "}
                    {book.language.toUpperCase()}
                  </Badge>
                )}
              </div>

              {/* Reading Progress */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {dictionary?.currentlyReading.readingProgress ||
                    "Reading Progress"}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {dictionary?.currentlyReading.progress || "Progress"}:{" "}
                      {progressPercentage}%
                    </span>
                    <span>
                      {currentPage} {dictionary?.currentlyReading.of || "of"}{" "}
                      {book.totalPages}{" "}
                      {dictionary?.currentlyReading.pages || "pages"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  {startedAt && (
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {dictionary?.currentlyReading.started || "Started"}:{" "}
                      {new Date(startedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {dictionary?.currentlyReading.status || "Status"}:
                </span>
                <Badge
                  variant={status === "READING" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {status === "READING"
                    ? dictionary?.readingStatus.reading || "Reading"
                    : status.toLowerCase()}
                </Badge>
              </div>
            </div>
          </div>

          {book.description && (
            <>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">
                  {dictionary?.currentlyReading.description || "Description"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {book.description}
                </p>
              </div>
            </>
          )}
          <div className="flex gap-4 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {dictionary?.common.close || "Close"}
            </Button>
            <Button onClick={handleUpdateProgress}>
              {dictionary?.currentlyReading.updateProgress || "Update Progress"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
