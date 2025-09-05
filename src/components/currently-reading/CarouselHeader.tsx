"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentlyReading } from "@/contexts/CurrentlyReadingContext";

export function CarouselHeader() {
  const {
    dictionary,
    totalPages,
    canGoBack,
    canGoForward,
    handlePrevious,
    handleNext,
  } = useCurrentlyReading();

  return (
    <section className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-semibold mb-1">
        {dictionary ? dictionary.currentlyReading.title : "Currently Reading"}
      </h3>

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
    </section>
  );
}
