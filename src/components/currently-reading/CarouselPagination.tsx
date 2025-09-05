"use client";

import { useCurrentlyReading } from "@/contexts/CurrentlyReadingContext";

export function CarouselPagination() {
  const { totalPages, currentIndex, setCurrentIndex } = useCurrentlyReading();

  if (totalPages <= 1) return null;

  return (
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
  );
}
