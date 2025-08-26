"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const statusOptions = {
  WANT_TO_READ: {
    label: "Want to Read",
    color: "bg-gray-100 text-gray-800",
    description: "Add to reading list",
  },
  READING: {
    label: "Currently Reading",
    color: "bg-blue-100 text-blue-800",
    description: "Currently in progress",
  },
  FINISHED: {
    label: "Finished",
    color: "bg-green-100 text-green-800",
    description: "Completed reading",
  },
  PAUSED: {
    label: "Paused",
    color: "bg-yellow-100 text-yellow-800",
    description: "Temporarily stopped",
  },
  DNF: {
    label: "Did Not Finish",
    color: "bg-red-100 text-red-800",
    description: "Stopped reading",
  },
};

type BookStatus = keyof typeof statusOptions;

interface StatusSelectorProps {
  currentStatus: BookStatus;
  onStatusChange: (newStatus: BookStatus) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StatusSelector({
  currentStatus,
  onStatusChange,
  disabled = false,
  size = "md",
}: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = statusOptions[currentStatus];

  const handleStatusChange = (newStatus: BookStatus) => {
    if (newStatus !== currentStatus) {
      onStatusChange(newStatus);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={`justify-between ${
            size === "sm"
              ? "h-8 px-2 text-xs"
              : size === "lg"
              ? "h-12 px-4 text-base"
              : "h-10 px-3 text-sm"
          }`}
        >
          <Badge
            variant="secondary"
            className={`${currentOption.color} mr-2 ${
              size === "sm" ? "text-xs px-1.5 py-0.5" : ""
            }`}
          >
            {currentOption.label}
          </Badge>
          <ChevronDown
            className={`${
              size === "sm" ? "h-3 w-3" : "h-4 w-4"
            } transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="start">
        {Object.entries(statusOptions).map(([status, option]) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleStatusChange(status as BookStatus)}
            className="cursor-pointer p-3"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`${option.color} text-xs`}
                  >
                    {option.label}
                  </Badge>
                  {status === currentStatus && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {option.description}
                </span>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Progress Update Modal Component
interface ProgressUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { currentPage?: number; status?: BookStatus }) => void;
  currentStatus: BookStatus;
  currentPage: number;
  totalPages: number;
  bookTitle: string;
  isUpdating?: boolean;
}

export function ProgressUpdateModal({
  isOpen,
  onClose,
  onSave,
  currentStatus,
  currentPage,
  totalPages,
  bookTitle,
  isUpdating = false,
}: ProgressUpdateModalProps) {
  const [newStatus, setNewStatus] = useState<BookStatus>(currentStatus);
  const [newPage, setNewPage] = useState<string>(currentPage.toString());

  const handleSave = () => {
    const pageNumber = parseInt(newPage) || currentPage;
    const clampedPage = Math.max(0, Math.min(pageNumber, totalPages));

    onSave({
      status: newStatus,
      currentPage: clampedPage,
    });
  };

  const handleClose = () => {
    setNewStatus(currentStatus);
    setNewPage(currentPage.toString());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">
                Update Reading Progress
              </h2>
              <p className="text-sm text-muted-foreground">{bookTitle}</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Reading Status
              </label>
              <StatusSelector
                currentStatus={newStatus}
                onStatusChange={setNewStatus}
                disabled={isUpdating}
                size="md"
              />
            </div>

            {(newStatus === "READING" || newStatus === "FINISHED") && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Current Page ({totalPages} total)
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalPages}
                  value={newPage}
                  onChange={(e) => setNewPage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isUpdating}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isUpdating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
