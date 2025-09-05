"use client";

import { Dictionary } from "@/lib/dictionaries";
import {
  CurrentlyReadingProvider,
  useCurrentlyReading,
} from "@/contexts/CurrentlyReadingContext";
import {
  LoadingState,
  EmptyState,
  CarouselHeader,
  BooksGrid,
  CarouselPagination,
  ProgressUpdateModal,
  BookDetailsModal,
} from "@/components/currently-reading";

interface CurrentlyReadingCarouselProps {
  className?: string;
  dictionary?: Dictionary;
}

function CurrentlyReadingContent() {
  const { books, loading, selectedBookForDetails, handleCloseDetailsModal } =
    useCurrentlyReading();

  if (loading) {
    return <LoadingState />;
  }

  if (books.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <CarouselHeader />
      <BooksGrid />
      <CarouselPagination />
      <ProgressUpdateModal />
      <BookDetailsModal
        userBook={selectedBookForDetails}
        open={!!selectedBookForDetails}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
}

export function CurrentlyReadingCarousel({
  className = "",
  dictionary,
}: CurrentlyReadingCarouselProps) {
  return (
    <div className={className}>
      <CurrentlyReadingProvider dictionary={dictionary}>
        <CurrentlyReadingContent />
      </CurrentlyReadingProvider>
    </div>
  );
}
