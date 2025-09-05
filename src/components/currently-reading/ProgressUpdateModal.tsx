"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentlyReading } from "@/contexts/CurrentlyReadingContext";

export function ProgressUpdateModal() {
  const {
    selectedBookForUpdate,
    handleCloseProgressModal,
    handleProgressUpdate,
    dictionary,
  } = useCurrentlyReading();

  const [newPage, setNewPage] = useState(
    selectedBookForUpdate?.currentPage.toString() || "0"
  );
  const [isUpdating, setIsUpdating] = useState(false);

  if (!selectedBookForUpdate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(newPage) || 0;

    setIsUpdating(true);
    try {
      await handleProgressUpdate(pageNumber);
    } catch {
      // Error handling is done in context
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setNewPage(selectedBookForUpdate.currentPage.toString());
    handleCloseProgressModal();
  };

  return (
    <Dialog open={!!selectedBookForUpdate} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {dictionary
              ? dictionary.currentlyReading.updateProgress
              : "Update Reading Progress"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="page">
              {dictionary
                ? dictionary.currentlyReading.currentPage
                : "Current Page"}
            </Label>
            <div className="flex gap-2">
              <Input
                id="page"
                type="number"
                min="0"
                max={selectedBookForUpdate.book.totalPages}
                value={newPage}
                onChange={(e) => setNewPage(e.target.value)}
                placeholder="Enter page number"
                className="flex-1"
              />
              <span className="flex items-center text-sm text-muted-foreground">
                / {selectedBookForUpdate.book.totalPages}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              {dictionary ? dictionary.currentlyReading.cancel : "Cancel"}
            </Button>
            <Button type="submit" disabled={isUpdating} className="flex-1">
              {isUpdating
                ? dictionary
                  ? dictionary.currentlyReading.updating
                  : "Updating..."
                : dictionary
                ? dictionary.currentlyReading.update
                : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
