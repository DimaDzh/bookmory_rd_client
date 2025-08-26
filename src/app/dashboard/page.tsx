"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserDropdown } from "@/components/UserDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Search, BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookSearchModal from "@/components/BookSearchModal";
import { CurrentlyReadingModal } from "@/components/CurrentlyReadingModal";
import UserLibrary from "@/components/UserLibrary";

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [readingModalOpen, setReadingModalOpen] = useState(false);

  // Listen for custom events to open modals from library
  useEffect(() => {
    const handleOpenSearchModal = () => setSearchModalOpen(true);

    window.addEventListener("openSearchModal", handleOpenSearchModal);
    return () =>
      window.removeEventListener("openSearchModal", handleOpenSearchModal);
  }, []);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName || user?.username}!
            </h1>
            <p className="text-gray-600">Manage your personal book library</p>
          </div>

          {/* Main Action Buttons - First Line */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Button
              onClick={() => setSearchModalOpen(true)}
              size="lg"
              className="h-20 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Search className="h-6 w-6 mr-3" />
              Search Books
            </Button>

            <Button
              onClick={() => setReadingModalOpen(true)}
              variant="outline"
              size="lg"
              className="h-20 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              <BookOpenCheck className="h-6 w-6 mr-3" />
              Currently Reading
            </Button>
          </div>

          {/* My Library Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <UserLibrary />
          </div>
        </div>

        {/* Modals */}
        <BookSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
        />
        <CurrentlyReadingModal
          isOpen={readingModalOpen}
          onClose={() => setReadingModalOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
