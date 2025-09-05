"use client";

import Image from "next/image";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book } from "@/types/books";
import { useBookSearch } from "@/contexts/BookSearchContext";
import { interpolate } from "@/lib/helpers";

interface BookDetailsViewProps {
  book: Book;
}

export function BookDetailsView({ book }: BookDetailsViewProps) {
  const { dictionary, handleAddBook, handleDecline, isAdding } =
    useBookSearch();
  const { volumeInfo } = book;
  const thumbnail =
    volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;

  return (
    <section className="space-y-6">
      <div className="flex gap-6">
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

        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{volumeInfo.title}</h2>
            {volumeInfo.authors && (
              <p className="text-lg text-muted-foreground">
                {dictionary.bookSearch.by} {volumeInfo.authors.join(", ")}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {volumeInfo.publishedDate && (
              <Badge variant="secondary">
                {dictionary.bookSearch.published}:{" "}
                {new Date(volumeInfo.publishedDate).getFullYear()}
              </Badge>
            )}
            {volumeInfo.pageCount && (
              <Badge variant="secondary">
                {interpolate(dictionary.bookSearch.pages, {
                  count: volumeInfo.pageCount,
                })}
              </Badge>
            )}
            {volumeInfo.publisher && (
              <Badge variant="secondary">{volumeInfo.publisher}</Badge>
            )}
            {volumeInfo.categories && volumeInfo.categories[0] && (
              <Badge variant="secondary">{volumeInfo.categories[0]}</Badge>
            )}
            {volumeInfo.language && (
              <Badge variant="secondary">
                {dictionary.bookSearch.language}:{" "}
                {volumeInfo.language.toUpperCase()}
              </Badge>
            )}
          </div>
          {volumeInfo.description && (
            <div>
              <h3 className="font-semibold mb-2">
                {dictionary.bookSearch.description}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-h-40 overflow-y-auto">
                {volumeInfo.description.replace(/<[^>]*>/g, "")}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-4 justify-end pt-4 border-t">
        <Button variant="outline" onClick={handleDecline} disabled={isAdding}>
          {dictionary.bookSearch.decline}
        </Button>
        <Button onClick={() => handleAddBook(book)} disabled={isAdding}>
          {isAdding ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {dictionary.bookSearch.addingToLibrary}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {dictionary.bookSearch.addToLibrary}
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
