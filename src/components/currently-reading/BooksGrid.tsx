"use client";

import { useCurrentlyReading } from "@/contexts/CurrentlyReadingContext";
import { ReadingBookCard } from "./ReadingBookCard";

export function BooksGrid() {
  const { currentBooks } = useCurrentlyReading();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {currentBooks.map((userBook) => (
        <ReadingBookCard key={userBook.id} userBook={userBook} />
      ))}
    </div>
  );
}
