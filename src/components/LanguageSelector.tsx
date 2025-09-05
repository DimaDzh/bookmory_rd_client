"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dictionary } from "@/lib/dictionaries";

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

const languageOptions: LanguageOption[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
];

interface LanguageSelectorProps {
  currentLocale: string;
  dictionary: Dictionary;
  variant?: "default" | "minimal";
  size?: "sm" | "md" | "lg";
}

export function LanguageSelector({
  currentLocale,
  dictionary,
  variant = "default",
  size = "md",
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const currentLanguage =
    languageOptions.find((lang) => lang.code === currentLocale) ||
    languageOptions[0];

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    // Remove the current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "");

    // Navigate to the new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);

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
            className="flex items-center gap-2 px-2"
            title={dictionary.languageSelector.language}
          >
            <Globe className={iconSizeClasses[size]} />
            <span className="text-sm">{currentLanguage.flag}</span>
            <ChevronDown
              className={`${iconSizeClasses.sm} transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {languageOptions.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
              </div>
              {language.code === currentLocale && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`justify-between ${buttonSizeClasses[size]}`}
        >
          <div className="flex items-center gap-2">
            <Globe className={iconSizeClasses[size]} />
            <span className="hidden sm:inline">
              {dictionary.languageSelector.language}:
            </span>
            <span className="text-sm">{currentLanguage.flag}</span>
            <span className="hidden md:inline">{currentLanguage.name}</span>
          </div>
          <ChevronDown
            className={`${iconSizeClasses[size]} transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        {languageOptions.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="cursor-pointer flex items-center justify-between p-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{language.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{language.name}</span>
                <span className="text-xs text-muted-foreground">
                  {dictionary.languageSelector[
                    language.code as keyof typeof dictionary.languageSelector
                  ] || language.name}
                </span>
              </div>
            </div>
            {language.code === currentLocale && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
