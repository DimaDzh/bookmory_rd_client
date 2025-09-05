"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentlyReading } from "@/contexts/CurrentlyReadingContext";
import { interpolate } from "@/lib/helpers";

export function CarouselHeader() {
  const {
    books,
    dictionary,
    totalPages,
    canGoBack,
    canGoForward,
    handlePrevious,
    handleNext,
  } = useCurrentlyReading();

  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold mb-1">
          {dictionary ? dictionary.currentlyReading.title : "Currently Reading"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {dictionary
            ? interpolate(dictionary.currentlyReading.booksInProgress, {
                count: books.length,
              })
            : `${books.length} book${
                books.length !== 1 ? "s" : ""
              } in progress`}
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
  );
}
