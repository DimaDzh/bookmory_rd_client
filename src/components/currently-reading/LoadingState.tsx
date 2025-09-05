"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCurrentlyReading } from "@/contexts/CurrentlyReadingContext";

export function LoadingState() {
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
      <div className="flex gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1">
            <Card className="h-48 animate-pulse">
              <CardContent className="p-3 h-full flex flex-col">
                <div className="w-full h-20 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded mb-1" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
