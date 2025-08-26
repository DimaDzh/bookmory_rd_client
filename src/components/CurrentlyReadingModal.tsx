"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BookOpen, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { booksService } from "@/services/books";
import { UserBook } from "@/types/books";

interface CurrentlyReadingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CurrentlyReadingModal({
  open,
  onOpenChange,
}: CurrentlyReadingModalProps) {
  const [books, setBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      if (!open) return;

      setLoading(true);
      try {
        const response = await booksService.getUserLibrary({
          status: "READING",
          limit: 20,
        });
        setBooks(response.books);
      } catch (error) {
        console.error("Failed to load currently reading books:", error);
        toast("Failed to load your currently reading books.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Currently Reading</DialogTitle>
          <DialogDescription>
            Books you&apos;re currently reading
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <BookOpen className="h-8 w-8 animate-pulse mx-auto mb-2" />
                <p>Loading your reading list...</p>
              </div>
            </div>
          ) : books.length > 0 ? (
            <div className="space-y-4">
              {books.map((userBook) => (
                <ReadingBookCard key={userBook.id} userBook={userBook} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No books currently reading</h3>
              <p>Start reading a book to see it here.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ReadingBookCardProps {
  userBook: UserBook;
}

function ReadingBookCard({ userBook }: ReadingBookCardProps) {
  const { book, currentPage, progressPercentage, startedAt } = userBook;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
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
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="font-medium line-clamp-2 mb-1">{book.title}</h4>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </div>
              <Badge variant="secondary">Reading</Badge>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Page {currentPage} of {book.totalPages}
                </span>
                {startedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Started {new Date(startedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
