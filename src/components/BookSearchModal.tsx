"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dictionary } from "@/lib/dictionaries";
import {
  BookSearchProvider,
  useBookSearch,
} from "@/contexts/BookSearchContext";
import {
  SearchInput,
  SearchResults,
  BookDetailsView,
} from "@/components/book-search";

interface BookSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  dictionary: Dictionary;
}

function BookSearchModalContent() {
  const { selectedBook, dictionary } = useBookSearch();

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle>
          {selectedBook
            ? dictionary.bookSearch.bookDetailsTitle
            : dictionary.bookSearch.searchBooksTitle}
        </DialogTitle>
        <DialogDescription>
          {selectedBook
            ? dictionary.bookSearch.bookDetailsDescription
            : dictionary.bookSearch.searchDescription}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {selectedBook ? (
          <BookDetailsView book={selectedBook} />
        ) : (
          <>
            <SearchInput />
            <div className="max-h-[500px] overflow-y-auto">
              <SearchResults />
            </div>
          </>
        )}
      </div>
    </DialogContent>
  );
}

export default function BookSearchModal({
  isOpen,
  onClose,
  dictionary,
}: BookSearchModalProps) {
  return (
    <BookSearchProvider dictionary={dictionary} onClose={onClose}>
      <BookSearchDialog isOpen={isOpen} />
    </BookSearchProvider>
  );
}

function BookSearchDialog({ isOpen }: { isOpen: boolean }) {
  const { handleClose } = useBookSearch();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <BookSearchModalContent />
    </Dialog>
  );
}
