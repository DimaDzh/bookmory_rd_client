"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Book,
  Heart,
  Star,
  Trash2,
  Edit,
  BookOpen,
  TrendingUp,
  Filter,
  Grid3X3,
  List,
  Search,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  useUserLibrary,
  useLibraryStats,
  useRemoveBookFromLibrary,
  useUpdateProgress,
  createBooksQueryKeys,
} from "@/hooks/useBooks";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { UserBook } from "@/types/books";
import { ProgressUpdateModal } from "@/components/StatusSelector";
import { Dictionary } from "@/lib/dictionaries";

const statusColors = {
  WANT_TO_READ: "bg-gray-100 text-gray-800",
  READING: "bg-blue-100 text-blue-800",
  FINISHED: "bg-green-100 text-green-800",
  PAUSED: "bg-yellow-100 text-yellow-800",
  DNF: "bg-red-100 text-red-800",
};

const statusLabels = {
  WANT_TO_READ: "Want to Read",
  READING: "Reading",
  FINISHED: "Finished",
  PAUSED: "Paused",
  DNF: "Did Not Finish",
};

interface UserLibraryProps {
  dictionary?: Dictionary;
}

export default function UserLibrary({ dictionary }: UserLibraryProps) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBookForUpdate, setSelectedBookForUpdate] =
    useState<UserBook | null>(null);
  const { toast } = useToast();

  const queryKeys = createBooksQueryKeys(user?.id);

  const interpolate = (
    template: string,
    values: Record<string, string | number>
  ) => {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return values[key] !== undefined ? String(values[key]) : match;
    });
  };

  const getStatusLabels = () => {
    if (!dictionary) return statusLabels;

    return {
      WANT_TO_READ: dictionary.readingStatus.wantToRead,
      READING: dictionary.readingStatus.reading,
      FINISHED: dictionary.readingStatus.finished,
      PAUSED: dictionary.readingStatus.paused,
      DNF: dictionary.readingStatus.dnf,
    };
  };

  const localizedStatusLabels = getStatusLabels();

  const queryClient = useQueryClient();
  const { data: libraryData, isLoading: booksLoading } = useUserLibrary();
  const { data: stats, isLoading: statsLoading } = useLibraryStats();
  const removeBookMutation = useRemoveBookFromLibrary();
  const updateProgressMutation = useUpdateProgress();

  const books = libraryData?.books || [];
  const loading = booksLoading || statsLoading;

  const handleRemoveBook = async (bookId: string, title: string) => {
    try {
      await removeBookMutation.mutateAsync(bookId);
      const message = dictionary
        ? interpolate(dictionary.library.removeSuccess, { title })
        : `"${title}" has been removed from your library.`;
      toast(message);
    } catch (error) {
      console.error("Failed to remove book:", error);
      const errorMessage = dictionary
        ? dictionary.library.removeFailed
        : "Failed to remove book. Please try again.";
      toast(errorMessage);
    }
  };

  const handleStatusChange = async (
    userBook: UserBook,
    newStatus: "WANT_TO_READ" | "READING" | "FINISHED" | "PAUSED" | "DNF"
  ) => {
    // Optimistic update - immediately update the UI
    const previousData = queryClient.getQueryData(queryKeys.userBooks.list());
    const previousReadingData = queryClient.getQueryData(
      queryKeys.userBooks.list({ status: "READING" })
    );

    queryClient.setQueryData(queryKeys.userBooks.list(), (oldData: unknown) => {
      if (!oldData || typeof oldData !== "object" || !("books" in oldData))
        return oldData;
      const data = oldData as { books: UserBook[] };

      return {
        ...data,
        books: data.books.map((book: UserBook) =>
          book.id === userBook.id ? { ...book, status: newStatus } : book
        ),
      };
    });

    queryClient.setQueryData(
      queryKeys.userBooks.list({ status: "READING" }),
      (oldData: unknown) => {
        if (!oldData || typeof oldData !== "object" || !("books" in oldData))
          return oldData;
        const data = oldData as { books: UserBook[] };

        if (newStatus === "READING" && userBook.status !== "READING") {
          const updatedUserBook = { ...userBook, status: newStatus };
          return {
            ...data,
            books: [...data.books, updatedUserBook],
          };
        } else if (newStatus !== "READING" && userBook.status === "READING") {
          // Removing book from currently reading
          return {
            ...data,
            books: data.books.filter(
              (book: UserBook) => book.id !== userBook.id
            ),
          };
        } else if (newStatus === "READING" && userBook.status === "READING") {
          // Updating existing currently reading book
          return {
            ...data,
            books: data.books.map((book: UserBook) =>
              book.id === userBook.id ? { ...book, status: newStatus } : book
            ),
          };
        }

        return oldData;
      }
    );

    // Also update stats cache optimistically
    queryClient.setQueryData(
      queryKeys.userBooks.stats(),
      (oldStats: unknown) => {
        if (!oldStats || typeof oldStats !== "object") return oldStats;

        const stats = { ...oldStats } as Record<string, number>;

        // Decrease old status count
        const oldStatusKey = userBook.status.toLowerCase().replace("_", "");
        const statusKeyMap: Record<string, string> = {
          wanttoread: "wantToRead",
          reading: "currentlyReading",
          finished: "finished",
          paused: "paused",
          dnf: "didNotFinish",
        };

        const oldKey = statusKeyMap[oldStatusKey] || oldStatusKey;
        if (stats[oldKey] > 0) {
          stats[oldKey] -= 1;
        }

        // Increase new status count
        const newStatusKey = newStatus.toLowerCase().replace("_", "");
        const newKey = statusKeyMap[newStatusKey] || newStatusKey;
        stats[newKey] = (stats[newKey] || 0) + 1;

        return stats;
      }
    );

    try {
      await updateProgressMutation.mutateAsync({
        bookId: userBook.bookId,
        data: { status: newStatus },
      });
      const message = dictionary
        ? interpolate(dictionary.library.statusUpdated, {
            status: localizedStatusLabels[newStatus],
          })
        : `Book status updated to "${statusLabels[newStatus]}"`;
      toast(message);
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData(queryKeys.userBooks.list(), previousData);
      queryClient.setQueryData(
        queryKeys.userBooks.list({ status: "READING" }),
        previousReadingData
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.userBooks.stats(),
      });

      console.error("Failed to update status:", error);
      const errorMessage = dictionary
        ? dictionary.library.statusFailed
        : "Failed to update status. Please try again.";
      toast(errorMessage);
    }
  };

  const handleOpenUpdateModal = (userBook: UserBook) => {
    setSelectedBookForUpdate(userBook);
  };

  const handleSaveProgress = async (data: {
    currentPage?: number;
    status?: "WANT_TO_READ" | "READING" | "FINISHED" | "PAUSED" | "DNF";
  }) => {
    if (!selectedBookForUpdate) return;

    // Optimistic update for progress
    const previousData = queryClient.getQueryData(queryKeys.userBooks.list());
    const previousReadingData = queryClient.getQueryData(
      queryKeys.userBooks.list({ status: "READING" })
    );

    // Calculate new progress percentage if currentPage is provided
    const newProgressPercentage =
      data.currentPage !== undefined
        ? Math.round(
            (data.currentPage / selectedBookForUpdate.book.totalPages) * 100
          )
        : undefined;

    // Optimistically update the main library book data
    queryClient.setQueryData(queryKeys.userBooks.list(), (oldData: unknown) => {
      if (!oldData || typeof oldData !== "object" || !("books" in oldData))
        return oldData;
      const libraryData = oldData as { books: UserBook[] };

      return {
        ...libraryData,
        books: libraryData.books.map((book: UserBook) =>
          book.id === selectedBookForUpdate.id
            ? {
                ...book,
                ...(data.status && { status: data.status }),
                ...(data.currentPage !== undefined && {
                  currentPage: data.currentPage,
                }),
                ...(newProgressPercentage !== undefined && {
                  progressPercentage: newProgressPercentage,
                }),
              }
            : book
        ),
      };
    });

    // Update Currently Reading filtered cache if status is changing
    if (data.status && data.status !== selectedBookForUpdate.status) {
      queryClient.setQueryData(
        queryKeys.userBooks.list({ status: "READING" }),
        (oldData: unknown) => {
          if (!oldData || typeof oldData !== "object" || !("books" in oldData))
            return oldData;
          const libraryData = oldData as { books: UserBook[] };

          const updatedBook = {
            ...selectedBookForUpdate,
            status: data.status!,
            ...(data.currentPage !== undefined && {
              currentPage: data.currentPage,
            }),
            ...(newProgressPercentage !== undefined && {
              progressPercentage: newProgressPercentage,
            }),
          };

          if (
            data.status === "READING" &&
            selectedBookForUpdate.status !== "READING"
          ) {
            // Adding book to currently reading
            return {
              ...libraryData,
              books: [...libraryData.books, updatedBook],
            };
          } else if (
            data.status !== "READING" &&
            selectedBookForUpdate.status === "READING"
          ) {
            // Removing book from currently reading
            return {
              ...libraryData,
              books: libraryData.books.filter(
                (book: UserBook) => book.id !== selectedBookForUpdate.id
              ),
            };
          } else if (
            data.status === "READING" &&
            selectedBookForUpdate.status === "READING"
          ) {
            // Updating existing currently reading book
            return {
              ...libraryData,
              books: libraryData.books.map((book: UserBook) =>
                book.id === selectedBookForUpdate.id ? updatedBook : book
              ),
            };
          }

          return oldData;
        }
      );
    } else if (
      selectedBookForUpdate.status === "READING" &&
      data.currentPage !== undefined
    ) {
      // Update progress for existing currently reading book
      queryClient.setQueryData(
        queryKeys.userBooks.list({ status: "READING" }),
        (oldData: unknown) => {
          if (!oldData || typeof oldData !== "object" || !("books" in oldData))
            return oldData;
          const libraryData = oldData as { books: UserBook[] };

          return {
            ...libraryData,
            books: libraryData.books.map((book: UserBook) =>
              book.id === selectedBookForUpdate.id
                ? {
                    ...book,
                    ...(data.currentPage !== undefined && {
                      currentPage: data.currentPage,
                    }),
                    ...(newProgressPercentage !== undefined && {
                      progressPercentage: newProgressPercentage,
                    }),
                  }
                : book
            ),
          };
        }
      );
    }

    // Update stats if status changed
    if (data.status && data.status !== selectedBookForUpdate.status) {
      queryClient.setQueryData(
        queryKeys.userBooks.stats(),
        (oldStats: unknown) => {
          if (!oldStats || typeof oldStats !== "object") return oldStats;

          const stats = { ...oldStats } as Record<string, number>;
          const statusKeyMap: Record<string, string> = {
            wanttoread: "wantToRead",
            reading: "currentlyReading",
            finished: "finished",
            paused: "paused",
            dnf: "didNotFinish",
          };

          // Decrease old status count
          const oldStatusKey = selectedBookForUpdate.status
            .toLowerCase()
            .replace("_", "");
          const oldKey = statusKeyMap[oldStatusKey] || oldStatusKey;
          if (stats[oldKey] > 0) {
            stats[oldKey] -= 1;
          }

          // Increase new status count
          const newStatusKey = data.status!.toLowerCase().replace("_", "");
          const newKey = statusKeyMap[newStatusKey] || newStatusKey;
          stats[newKey] = (stats[newKey] || 0) + 1;

          return stats;
        }
      );
    }

    try {
      await updateProgressMutation.mutateAsync({
        bookId: selectedBookForUpdate.bookId,
        data,
      });
      const message = dictionary
        ? dictionary.library.updateSuccess
        : "Progress updated successfully!";
      toast(message);
      setSelectedBookForUpdate(null);
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData(queryKeys.userBooks.list(), previousData);
      queryClient.setQueryData(
        queryKeys.userBooks.list({ status: "READING" }),
        previousReadingData
      );
      if (data.status) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.userBooks.stats(),
        });
      }

      console.error("Failed to update progress:", error);
      const errorMessage = dictionary
        ? dictionary.library.updateFailed
        : "Failed to update progress. Please try again.";
      toast(errorMessage);
    }
  };

  // Filter and search books
  const filteredBooks = books.filter((userBook: UserBook) => {
    const matchesStatus = !filter || userBook.status === filter;
    const matchesSearch =
      !searchQuery ||
      userBook.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userBook.book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {dictionary ? dictionary.library.title : "My Library"}
            </h2>
            <p className="text-muted-foreground">
              {dictionary
                ? dictionary.library.subtitle
                : "Manage your personal book collection"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BookOpen className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">
              {dictionary
                ? dictionary.library.loading
                : "Loading your library..."}
            </p>
            <p className="text-sm text-muted-foreground">
              {dictionary
                ? dictionary.library.loadingDescription
                : "Please wait while we fetch your books"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {dictionary ? dictionary.library.title : "My Library"}
          </h2>
          <p className="text-muted-foreground">
            {dictionary
              ? interpolate(dictionary.library.bookCount, {
                  count: books.length,
                })
              : `${books.length} ${
                  books.length === 1 ? "book" : "books"
                } in your collection`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                dictionary
                  ? dictionary.library.searchPlaceholder
                  : "Search books..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid3X3 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Enhanced Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <EnhancedStatsCard
            title={
              dictionary ? dictionary.libraryStats.totalBooks : "Total Books"
            }
            value={stats.totalBooks}
            icon={<Book className="h-4 w-4" />}
            color="bg-blue-500"
          />
          <EnhancedStatsCard
            title={dictionary ? dictionary.libraryStats.reading : "Reading"}
            value={stats.currentlyReading}
            icon={<BookOpen className="h-4 w-4" />}
            color="bg-green-500"
          />
          <EnhancedStatsCard
            title={dictionary ? dictionary.libraryStats.finished : "Finished"}
            value={stats.finished}
            icon={<Star className="h-4 w-4" />}
            color="bg-yellow-500"
          />
          <EnhancedStatsCard
            title={dictionary ? dictionary.libraryStats.favorites : "Favorites"}
            value={stats.favorites}
            icon={<Heart className="h-4 w-4" />}
            color="bg-red-500"
          />
          <EnhancedStatsCard
            title={
              dictionary ? dictionary.libraryStats.pagesRead : "Pages Read"
            }
            value={stats.totalPagesRead}
            icon={<TrendingUp className="h-4 w-4" />}
            color="bg-purple-500"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 pb-4 border-b">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground mr-2">
          {dictionary ? dictionary.library.filterByStatus : "Filter by status:"}
        </span>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("")}
          >
            {dictionary
              ? interpolate(dictionary.library.allBooks, {
                  count: books.length,
                })
              : `All Books (${books.length})`}
          </Button>
          {Object.entries(localizedStatusLabels).map(([status, label]) => {
            const count = books.filter((book) => book.status === status).length;
            return (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {label} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Books Display */}
      {filteredBooks.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          }
        >
          {filteredBooks.map((userBook: UserBook) => (
            <EnhancedBookCard
              key={userBook.id}
              userBook={userBook}
              onRemove={handleRemoveBook}
              onStatusChange={handleStatusChange}
              onOpenUpdateModal={handleOpenUpdateModal}
              viewMode={viewMode}
              isRemoving={removeBookMutation.isPending}
              isUpdating={false}
              dictionary={dictionary}
              localizedStatusLabels={localizedStatusLabels}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="mx-auto max-w-md">
            <BookOpen className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {filter
                ? dictionary
                  ? interpolate(dictionary.library.noFilterResults, {
                      status:
                        localizedStatusLabels[
                          filter as keyof typeof localizedStatusLabels
                        ],
                    })
                  : `No books found with status "${
                      statusLabels[filter as keyof typeof statusLabels]
                    }"`
                : searchQuery
                ? dictionary
                  ? interpolate(dictionary.library.noSearchResults, {
                      query: searchQuery,
                    })
                  : `No books found for "${searchQuery}"`
                : dictionary
                ? dictionary.library.noBooks
                : "Your library is empty"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filter || searchQuery
                ? dictionary
                  ? dictionary.library.adjustFilters
                  : "Try adjusting your filters or search terms."
                : dictionary
                ? dictionary.library.noBooksDescription
                : "Start by searching for books to add to your collection."}
            </p>
            {!filter && !searchQuery && (
              <Button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("openSearchModal"))
                }
              >
                <Search className="h-4 w-4 mr-2" />
                {dictionary ? dictionary.dashboard.searchBooks : "Search Books"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      <ProgressUpdateModal
        isOpen={!!selectedBookForUpdate}
        onClose={() => setSelectedBookForUpdate(null)}
        bookTitle={selectedBookForUpdate?.book.title || ""}
        currentPage={selectedBookForUpdate?.currentPage || 0}
        totalPages={selectedBookForUpdate?.book.totalPages || 0}
        currentStatus={selectedBookForUpdate?.status || "WANT_TO_READ"}
        onSave={handleSaveProgress}
      />
    </div>
  );
}

// Enhanced Stats Card Component
interface EnhancedStatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function EnhancedStatsCard({
  title,
  value,
  icon,
  color,
}: EnhancedStatsCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
          <div className={`p-3 rounded-full ${color} text-white`}>{icon}</div>
        </div>
        <div className={`absolute inset-x-0 bottom-0 h-1 ${color}`} />
      </CardContent>
    </Card>
  );
}

// Enhanced Book Card Component
interface EnhancedBookCardProps {
  userBook: UserBook;
  onRemove: (bookId: string, title: string) => void;
  onStatusChange: (userBook: UserBook, status: UserBook["status"]) => void;
  onOpenUpdateModal: (userBook: UserBook) => void;
  viewMode: "grid" | "list";
  isRemoving: boolean;
  isUpdating: boolean;
  dictionary?: Dictionary;
  localizedStatusLabels?: Record<string, string>;
}

function EnhancedBookCard({
  userBook,
  onRemove,
  onStatusChange,
  onOpenUpdateModal,
  viewMode,
  isRemoving,
  isUpdating,
  dictionary,
  localizedStatusLabels,
}: EnhancedBookCardProps) {
  const { book, status, currentPage, progressPercentage, isFavorite } =
    userBook;

  const statusLabelsToUse = localizedStatusLabels || statusLabels;

  // Create localized status options
  const localizedStatusOptions = {
    WANT_TO_READ: {
      label: statusLabelsToUse.WANT_TO_READ,
      color: "bg-gray-500",
    },
    READING: {
      label: statusLabelsToUse.READING,
      color: "bg-blue-500",
    },
    FINISHED: {
      label: statusLabelsToUse.FINISHED,
      color: "bg-green-500",
    },
    PAUSED: {
      label: statusLabelsToUse.PAUSED,
      color: "bg-yellow-500",
    },
    DNF: {
      label: statusLabelsToUse.DNF,
      color: "bg-red-500",
    },
  };

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Book Cover */}
            <div className="flex-shrink-0">
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  width={80}
                  height={120}
                  className="object-cover rounded-lg shadow-md"
                  unoptimized
                />
              ) : (
                <div className="w-20 h-30 bg-muted rounded-lg flex items-center justify-center shadow-md">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-muted-foreground mb-2">{book.author}</p>
                </div>
                {isFavorite && (
                  <Heart className="h-5 w-5 text-red-500 flex-shrink-0 ml-2" />
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className={statusColors[status]}>
                  {statusLabelsToUse[status]}
                </Badge>
                <Badge variant="outline">{book.totalPages} pages</Badge>
                {book.genres && book.genres[0] && (
                  <Badge variant="outline">{book.genres[0]}</Badge>
                )}
              </div>

              {/* Progress Bar for Reading Status */}
              {status === "READING" && (
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Reading Progress</span>
                    <span className="font-medium">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Page {currentPage} of {book.totalPages}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      {dictionary
                        ? dictionary.library.updateStatus
                        : "Update Status"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {Object.entries(localizedStatusOptions).map(
                      ([status, option]) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() =>
                            onStatusChange(
                              userBook,
                              status as UserBook["status"]
                            )
                          }
                          className="flex items-center gap-2"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              option.color.split(" ")[0]
                            }`}
                          />
                          {option.label}
                          {status === userBook.status && (
                            <Check className="h-4 w-4 ml-auto" />
                          )}
                        </DropdownMenuItem>
                      )
                    )}
                    <DropdownMenuItem
                      onClick={() => onOpenUpdateModal(userBook)}
                      className="border-t mt-1 pt-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {dictionary
                        ? dictionary.currentlyReading.updateProgress
                        : "Update Progress"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(userBook.bookId, book.title)}
                  disabled={isRemoving}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid View
  return (
    <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="space-y-3">
          {/* Book Cover */}
          <div className="relative mx-auto">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                width={120}
                height={180}
                className="object-cover rounded-lg shadow-lg mx-auto"
                unoptimized
              />
            ) : (
              <div className="w-30 h-45 bg-muted rounded-lg flex items-center justify-center shadow-lg mx-auto">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            {isFavorite && (
              <Heart className="absolute -top-2 -right-2 h-6 w-6 text-red-500 bg-white rounded-full p-1 shadow-md" />
            )}
          </div>

          {/* Book Title & Author */}
          <div className="text-center space-y-1">
            <CardTitle className="text-base leading-tight line-clamp-2 min-h-[2.5rem]">
              {book.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {book.author}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className={`${statusColors[status]} font-medium`}
            >
              {statusLabelsToUse[status]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0">
        {/* Progress Section for Reading Books */}
        {status === "READING" && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Progress</span>
              <span className="font-bold text-blue-600">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Page {currentPage} of {book.totalPages}
            </p>
          </div>
        )}

        {/* Book Meta Information */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {book.totalPages} pages
            </Badge>
            {book.genres && book.genres[0] && (
              <Badge variant="outline" className="text-xs">
                {book.genres[0]}
              </Badge>
            )}
          </div>

          {book.publisher && (
            <p className="text-xs text-muted-foreground text-center line-clamp-1">
              {book.publisher}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isUpdating}
              >
                <Edit className="h-4 w-4 mr-2" />
                {dictionary ? dictionary.library.status : "Status"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {Object.entries(localizedStatusOptions).map(
                ([status, option]) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() =>
                      onStatusChange(userBook, status as UserBook["status"])
                    }
                    className="flex items-center gap-2"
                  >
                    <div className={`w-2 h-2 rounded-full ${option.color}`} />
                    {option.label}
                    {status === userBook.status && (
                      <Check className="h-4 w-4 ml-auto" />
                    )}
                  </DropdownMenuItem>
                )
              )}
              <DropdownMenuItem
                onClick={() => onOpenUpdateModal(userBook)}
                className="border-t mt-1 pt-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                {dictionary
                  ? dictionary.currentlyReading.updateProgress
                  : "Update Progress"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(userBook.bookId, book.title)}
            disabled={isRemoving}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
