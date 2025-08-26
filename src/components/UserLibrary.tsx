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
  Target,
  Filter,
  Grid3X3,
  List,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  useUserLibrary,
  useLibraryStats,
  useRemoveBookFromLibrary,
} from "@/hooks/useBooks";
import { UserBook } from "@/types/books";

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

export default function UserLibrary() {
  const [filter, setFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  // Use TanStack Query hooks
  const { data: libraryData, isLoading: booksLoading } = useUserLibrary();
  const { data: stats, isLoading: statsLoading } = useLibraryStats();
  const removeBookMutation = useRemoveBookFromLibrary();

  const books = libraryData?.books || [];
  const loading = booksLoading || statsLoading;

  const handleRemoveBook = async (bookId: string, title: string) => {
    try {
      await removeBookMutation.mutateAsync(bookId);
      toast(`"${title}" has been removed from your library.`);
    } catch (error) {
      console.error("Failed to remove book:", error);
      toast("Failed to remove book. Please try again.");
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
            <h2 className="text-2xl font-bold tracking-tight">My Library</h2>
            <p className="text-muted-foreground">
              Manage your personal book collection
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BookOpen className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Loading your library...</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we fetch your books
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
          <h2 className="text-2xl font-bold tracking-tight">My Library</h2>
          <p className="text-muted-foreground">
            {books.length} {books.length === 1 ? "book" : "books"} in your
            collection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
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
            title="Total Books"
            value={stats.totalBooks}
            icon={<Book className="h-4 w-4" />}
            color="bg-blue-500"
          />
          <EnhancedStatsCard
            title="Reading"
            value={stats.currentlyReading}
            icon={<BookOpen className="h-4 w-4" />}
            color="bg-green-500"
          />
          <EnhancedStatsCard
            title="Finished"
            value={stats.finished}
            icon={<Star className="h-4 w-4" />}
            color="bg-yellow-500"
          />
          <EnhancedStatsCard
            title="Favorites"
            value={stats.favorites}
            icon={<Heart className="h-4 w-4" />}
            color="bg-red-500"
          />
          <EnhancedStatsCard
            title="Pages Read"
            value={stats.totalPagesRead}
            icon={<TrendingUp className="h-4 w-4" />}
            color="bg-purple-500"
          />
          <EnhancedStatsCard
            title="Avg Rating"
            value={stats.averageRating ? stats.averageRating.toFixed(1) : "—"}
            icon={<Target className="h-4 w-4" />}
            color="bg-orange-500"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 pb-4 border-b">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground mr-2">
          Filter by status:
        </span>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("")}
          >
            All Books ({books.length})
          </Button>
          {Object.entries(statusLabels).map(([status, label]) => {
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
              viewMode={viewMode}
              isRemoving={removeBookMutation.isPending}
              isUpdating={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="mx-auto max-w-md">
            <BookOpen className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {filter
                ? `No books found with status "${
                    statusLabels[filter as keyof typeof statusLabels]
                  }"`
                : searchQuery
                ? `No books found for "${searchQuery}"`
                : "Your library is empty"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filter || searchQuery
                ? "Try adjusting your filters or search terms."
                : "Start by searching for books to add to your collection."}
            </p>
            {!filter && !searchQuery && (
              <Button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("openSearchModal"))
                }
              >
                <Search className="h-4 w-4 mr-2" />
                Search Books
              </Button>
            )}
          </div>
        </div>
      )}
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
  viewMode: "grid" | "list";
  isRemoving: boolean;
  isUpdating: boolean;
}

function EnhancedBookCard({
  userBook,
  onRemove,
  viewMode,
  isRemoving,
  isUpdating,
}: EnhancedBookCardProps) {
  const { book, status, currentPage, progressPercentage, isFavorite } =
    userBook;

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
                  {statusLabels[status]}
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
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Progress
                </Button>
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
              {statusLabels[status]}
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
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={isUpdating}
          >
            <Edit className="h-4 w-4 mr-2" />
            Update
          </Button>
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
