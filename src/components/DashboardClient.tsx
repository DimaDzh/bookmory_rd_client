"use client";

import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookSearchModal from "@/components/BookSearchModal";
import { CurrentlyReadingCarousel } from "@/components/CurrentlyReadingCarousel";
import UserLibrary from "@/components/UserLibrary";
import { Dictionary } from "@/lib/dictionaries";
import { interpolate } from "@/lib/helpers";
import { useOpenModal } from "@/hooks/useOpenModal";
import { UserDropdown } from "@/components/UserDropdown";

interface DashboardClientProps {
  locale: string;
  dictionary: Dictionary;
}

export function DashboardClient({ dictionary }: DashboardClientProps) {
  const { user } = useAuth();
  const searchModal = useOpenModal({ eventName: "openSearchModal" });

  const welcomeMessage = interpolate(dictionary.dashboard.welcomeBack, {
    name: user?.firstName || dictionary.common.user,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                {dictionary.dashboard.title}
              </span>
            </div>
            <div className="flex items-center">
              <UserDropdown dictionary={dictionary} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {welcomeMessage}
          </h1>
          <p className="text-gray-600">{dictionary.dashboard.subtitle}</p>
        </div>

        {/* Main Action Button - Centered */}
        <div className="flex justify-center">
          <Button
            onClick={searchModal.open}
            size="lg"
            className="h-20 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 px-8"
          >
            <Search className="h-6 w-6 mr-3" />
            {dictionary.dashboard.searchBooks}
          </Button>
        </div>

        {/* Currently Reading Carousel */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <CurrentlyReadingCarousel dictionary={dictionary} />
        </div>

        {/* My Library Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <UserLibrary dictionary={dictionary} />
        </div>
      </div>

      {/* Modals */}
      <BookSearchModal
        isOpen={searchModal.isOpen}
        onClose={searchModal.close}
        dictionary={dictionary}
      />
    </div>
  );
}
