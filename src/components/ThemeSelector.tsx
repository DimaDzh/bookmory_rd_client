"use client";

import { useState } from "react";
import { Check, ChevronDown, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { Dictionary } from "@/lib/dictionaries";

type Theme = "light" | "dark" | "system";

interface ThemeOption {
  value: Theme;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const themeOptions: ThemeOption[] = [
  { value: "light", icon: Sun, description: "Light mode" },
  { value: "dark", icon: Moon, description: "Dark mode" },
  { value: "system", icon: Monitor, description: "Use system preference" },
];

interface ThemeSelectorProps {
  dictionary: Dictionary;
  variant?: "default" | "minimal";
  size?: "sm" | "md" | "lg";
}

export function ThemeSelector({
  dictionary,
  variant = "default",
  size = "md",
}: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const currentThemeOption =
    themeOptions.find((option) => option.value === theme) || themeOptions[2];

  const handleThemeChange = (newTheme: Theme) => {
    if (newTheme === theme) {
      setIsOpen(false);
      return;
    }

    setTheme(newTheme);
    setIsOpen(false);
  };

  const buttonSizeClasses = {
    sm: "h-8 px-2 text-xs",
    md: "h-10 px-3 text-sm",
    lg: "h-12 px-4 text-base",
  };

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  if (variant === "minimal") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 px-2 hover:bg-accent/50 dark:hover:bg-accent/30 transition-colors"
            title={dictionary.themeSelector.theme}
          >
            <currentThemeOption.icon
              className={`${iconSizeClasses[size]} text-muted-foreground dark:text-muted-foreground`}
            />
            <ChevronDown
              className={`${
                iconSizeClasses.sm
              } transition-transform text-muted-foreground dark:text-muted-foreground ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-48 bg-background dark:bg-card border border-border dark:border-border shadow-lg"
        >
          {themeOptions.map((themeOption) => {
            const Icon = themeOption.icon;
            return (
              <DropdownMenuItem
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption.value)}
                className="cursor-pointer flex items-center justify-between hover:bg-accent/50 dark:hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-foreground dark:text-foreground" />
                  <span className="text-foreground dark:text-foreground">
                    {dictionary.themeSelector[themeOption.value]}
                  </span>
                </div>
                {themeOption.value === theme && (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`justify-between ${buttonSizeClasses[size]} border-border dark:border-border bg-background dark:bg-card hover:bg-accent/50 dark:hover:bg-accent/30 transition-colors`}
        >
          <div className="flex items-center gap-2">
            <currentThemeOption.icon
              className={`${iconSizeClasses[size]} text-foreground dark:text-foreground`}
            />
            <span className="hidden sm:inline text-foreground dark:text-foreground">
              {dictionary.themeSelector.theme}:
            </span>
            <span className="hidden md:inline text-muted-foreground dark:text-muted-foreground">
              {dictionary.themeSelector[theme]}
            </span>
          </div>
          <ChevronDown
            className={`${
              iconSizeClasses[size]
            } transition-transform text-muted-foreground dark:text-muted-foreground ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 bg-background dark:bg-card border border-border dark:border-border shadow-lg"
        align="end"
      >
        {themeOptions.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => handleThemeChange(themeOption.value)}
              className="cursor-pointer flex items-center justify-between p-3 hover:bg-accent/50 dark:hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-foreground dark:text-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium text-foreground dark:text-foreground">
                    {dictionary.themeSelector[themeOption.value]}
                  </span>
                  {themeOption.value === "system" && (
                    <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {resolvedTheme === "dark"
                        ? "Currently dark"
                        : "Currently light"}
                    </span>
                  )}
                  {themeOption.description &&
                    themeOption.value !== "system" && (
                      <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                        {themeOption.description}
                      </span>
                    )}
                </div>
              </div>
              {themeOption.value === theme && (
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
