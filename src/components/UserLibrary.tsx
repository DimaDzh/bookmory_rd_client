"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Book, Heart, Star, Trash2, Edit, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { booksService } from "@/services/books";
import { UserBook, LibraryStats } from "@/types/books";

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
  const [books, setBooks] = useState<UserBook[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [libraryResponse, libraryStats] = await Promise.all([
          booksService.getUserLibrary(),
          booksService.getLibraryStats(),
        ]);
        setBooks(libraryResponse.books);
        setStats(libraryStats);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast("Failed to load your library. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const loadStats = async () => {
    try {
      const libraryStats = await booksService.getLibraryStats();
      setStats(libraryStats);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleRemoveBook = async (bookId: string, title: string) => {
    try {
      await booksService.removeBookFromLibrary(bookId);
      setBooks((prev) => prev.filter((book) => book.bookId !== bookId));
      toast(`"${title}" has been removed from your library.`);
      loadStats(); // Refresh stats
    } catch (error) {
      console.error("Failed to remove book:", error);
      toast("Failed to remove book. Please try again.");
    }
  };

  const filteredBooks = books.filter((userBook) => {
    if (!filter) return true;
    return userBook.status === filter;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BookOpen className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading your library...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Library</h1>
        <p className="text-muted-foreground">
          Manage your personal book collection
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Books"
            value={stats.totalBooks}
            icon={<Book className="h-4 w-4" />}
          />
          <StatsCard
            title="Currently Reading"
            value={stats.currentlyReading}
            icon={<BookOpen className="h-4 w-4" />}
          />
          <StatsCard
            title="Finished"
            value={stats.finished}
            icon={<Star className="h-4 w-4" />}
          />
          <StatsCard
            title="Favorites"
            value={stats.favorites}
            icon={<Heart className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("")}
          >
            All Books
          </Button>
          {Object.entries(statusLabels).map(([status, label]) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((userBook) => (
            <BookCard
              key={userBook.id}
              userBook={userBook}
              onRemove={handleRemoveBook}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4" />
          <p>
            {filter
              ? `No books found with status "${
                  statusLabels[filter as keyof typeof statusLabels]
                }"`
              : "Your library is empty. Start by searching for books to add."}
          </p>
        </div>
      )}
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BookCardProps {
  userBook: UserBook;
  onRemove: (bookId: string, title: string) => void;
}

function BookCard({ userBook, onRemove }: BookCardProps) {
  const { book, status, currentPage, progressPercentage, isFavorite } =
    userBook;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex gap-4">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              width={64}
              height={96}
              className="object-cover rounded flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-24 bg-muted rounded flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base leading-tight line-clamp-2 mb-1">
                {book.title}
              </CardTitle>
              {isFavorite && (
                <Heart className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
            <div className="flex gap-2">
              <Badge variant="secondary" className={statusColors[status]}>
                {statusLabels[status]}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Progress */}
        {status === "READING" && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Page {currentPage} of {book.totalPages}
            </p>
          </div>
        )}

        {/* Book Details */}
        <div className="space-y-2 mb-4">
          {book.publisher && (
            <p className="text-xs text-muted-foreground">{book.publisher}</p>
          )}

          <p className="text-xs text-muted-foreground">
            {book.totalPages} pages
          </p>

          {book.genres && book.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {book.genres.slice(0, 2).map((genre, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            Update
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(userBook.bookId, book.title)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
