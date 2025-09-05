"use client";

import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCurrentlyReading } from "@/contexts/CurrentlyReadingContext";

export function EmptyState() {
  const { dictionary } = useCurrentlyReading();

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">
          {dictionary ? dictionary.currentlyReading.title : "Currently Reading"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {dictionary
            ? dictionary.currentlyReading.subtitle
            : "Your active reading list"}
        </p>
      </div>
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4" />
          <h4 className="font-medium mb-2">
            {dictionary
              ? dictionary.currentlyReading.noBooks
              : "No books currently reading"}
          </h4>
          <p className="text-sm">
            {dictionary
              ? dictionary.currentlyReading.noBooksDescription
              : "Start reading a book to see it here."}
          </p>
        </div>
      </Card>
    </div>
  );
}
