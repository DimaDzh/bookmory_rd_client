"use client";

import Image from "next/image";
import { BookOpen, Clock, Plus, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserBook } from "@/types/books";
import { useCurrentlyReading } from "@/contexts/CurrentlyReadingContext";

interface ReadingBookCardProps {
  userBook: UserBook;
}

export function ReadingBookCard({ userBook }: ReadingBookCardProps) {
  const {
    handleOpenProgressModal,
    handleQuickProgressUpdate,
    dictionary,
    handleOpenDetailsModal,
  } = useCurrentlyReading();
  const { book, currentPage, progressPercentage, startedAt } = userBook;

  const handleCardClick = () => {
    handleOpenDetailsModal(userBook);
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
            {dictionary?.currentlyReading.reading || "Reading"}
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
                handleOpenProgressModal(userBook);
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
                    {dictionary?.currentlyReading.started || "Started"}{" "}
                    {new Date(startedAt).toLocaleDateString()}
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
                    handleQuickProgressUpdate(userBook, -1);
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
                    handleQuickProgressUpdate(userBook, 1);
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
