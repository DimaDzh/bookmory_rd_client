"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserDropdown } from "@/components/UserDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Search, BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookSearchModal from "@/components/BookSearchModal";
import CurrentlyReadingModal from "@/components/CurrentlyReadingModal";

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [readingModalOpen, setReadingModalOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  BookMory
                </span>
              </div>
              <div className="flex items-center">
                <UserDropdown />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName || user?.username}!
            </h1>
            <p className="text-gray-600">Manage your personal book library</p>
          </div>

          {/* Main Action Buttons - First Line */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Button
              onClick={() => setSearchModalOpen(true)}
              size="lg"
              className="h-20 text-lg font-medium"
            >
              <Search className="h-6 w-6 mr-3" />
              Search Books
            </Button>

            <Button
              onClick={() => setReadingModalOpen(true)}
              variant="outline"
              size="lg"
              className="h-20 text-lg font-medium"
            >
              <BookOpenCheck className="h-6 w-6 mr-3" />
              Books in Reading Status
            </Button>
          </div>

          {/* Quick Stats or Info Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Start Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Search for Books</h3>
                <p className="text-sm text-muted-foreground">
                  Use our Google Books integration to find books you want to
                  read
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Add to Library</h3>
                <p className="text-sm text-muted-foreground">
                  Add interesting books to your personal collection
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpenCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your reading progress and mark books as complete
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <BookSearchModal
          open={searchModalOpen}
          onOpenChange={setSearchModalOpen}
        />
        <CurrentlyReadingModal
          open={readingModalOpen}
          onOpenChange={setReadingModalOpen}
        />
      </div>
    </ProtectedRoute>
  );
}
