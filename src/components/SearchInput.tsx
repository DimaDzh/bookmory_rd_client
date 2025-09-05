"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBookSearch } from "@/contexts/BookSearchContext";

export function SearchInput() {
  const { dictionary, searchQuery, setSearchQuery, handleSearch } =
    useBookSearch();

  return (
    <div className="flex gap-2">
      <Input
        placeholder={dictionary.bookSearch.searchPlaceholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="flex-1"
      />
      <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
        <Search className="h-4 w-4 mr-2" />
        {dictionary.bookSearch.search}
      </Button>
    </div>
  );
}
