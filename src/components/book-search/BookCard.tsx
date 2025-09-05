"use client";

import Image from "next/image";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Book } from "@/types/books";
import { useBookSearch } from "@/contexts/BookSearchContext";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { dictionary, handleBookSelect } = useBookSearch();
  const { volumeInfo } = book;
  const thumbnail =
    volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => handleBookSelect(book)}
    >
      <CardContent className="p-4">
        <div className="text-center">
          <div className="mb-3">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={volumeInfo.title || "image"}
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

          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">
            {volumeInfo.title}
          </h3>
          {volumeInfo.authors && volumeInfo.authors[0] && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {dictionary.bookSearch.by} {volumeInfo.authors[0]}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
