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

export function DashboardClient({ locale, dictionary }: DashboardClientProps) {
  const { user } = useAuth();
  const searchModal = useOpenModal({ eventName: "openSearchModal" });

  const welcomeMessage = interpolate(dictionary.dashboard.welcomeBack, {
    name: user?.firstName || dictionary.common.user,
  });

  return (
    <div className="min-h-screen bg-background dark:bg-background transition-colors">
      <nav className="bg-card dark:bg-card shadow-sm border-b border-border dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary dark:text-primary" />
              <span className="ml-2 text-xl font-bold text-foreground dark:text-foreground">
                {dictionary.dashboard.title}
              </span>
            </div>
            <div className="flex items-center">
              <UserDropdown dictionary={dictionary} locale={locale} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground dark:text-foreground mb-2 transition-colors">
            {welcomeMessage}
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground transition-colors">
            {dictionary.dashboard.subtitle}
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={searchModal.open}
            size="lg"
            className="h-20 text-lg font-medium shadow-md hover:shadow-lg dark:shadow-lg dark:hover:shadow-xl transition-all duration-200 px-8 bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/90 text-primary-foreground dark:text-primary-foreground"
          >
            <Search className="h-6 w-6 mr-3" />
            {dictionary.dashboard.searchBooks}
          </Button>
        </div>

        <div className="bg-card dark:bg-card rounded-lg shadow-sm dark:shadow-md border border-border dark:border-border p-6 transition-colors">
          <CurrentlyReadingCarousel dictionary={dictionary} />
        </div>

        <div className="bg-card dark:bg-card rounded-lg shadow-sm dark:shadow-md border border-border dark:border-border p-6 transition-colors">
          <UserLibrary dictionary={dictionary} />
        </div>
      </main>

      <BookSearchModal
        isOpen={searchModal.isOpen}
        onClose={searchModal.close}
        dictionary={dictionary}
      />
    </div>
  );
}
