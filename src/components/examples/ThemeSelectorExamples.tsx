"use client";

import { ThemeSelector } from "@/components/ThemeSelector";
import { getDictionary, Dictionary } from "@/lib/dictionaries";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeSelectorExamplesProps {
  currentLocale: string;
}

export function ThemeSelectorExamples({
  currentLocale,
}: ThemeSelectorExamplesProps) {
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await getDictionary(currentLocale as "en" | "uk");
      setDictionary(dict);
    };
    loadDictionary();
  }, [currentLocale]);

  if (!dictionary) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Theme Selector Examples</h1>
        <p className="text-muted-foreground">
          Different variants and sizes of the ThemeSelector component
        </p>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>Current theme:</strong> {theme}
            {theme === "system" && ` (resolved: ${resolvedTheme})`}
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Default variant */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Default Variant</h2>
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Small size:</p>
              <ThemeSelector
                dictionary={dictionary}
                variant="default"
                size="sm"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Medium size (default):
              </p>
              <ThemeSelector
                dictionary={dictionary}
                variant="default"
                size="md"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Large size:</p>
              <ThemeSelector
                dictionary={dictionary}
                variant="default"
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* Minimal variant */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Minimal Variant</h2>
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Small size:</p>
              <ThemeSelector
                dictionary={dictionary}
                variant="minimal"
                size="sm"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Medium size:</p>
              <ThemeSelector
                dictionary={dictionary}
                variant="minimal"
                size="md"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Large size:</p>
              <ThemeSelector
                dictionary={dictionary}
                variant="minimal"
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* Usage in header */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Header Usage</h2>
          <div className="p-4 bg-background border rounded-lg">
            <nav className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded">
              <div className="text-lg font-bold">BookMory</div>
              <ThemeSelector
                dictionary={dictionary}
                variant="minimal"
                size="sm"
              />
            </nav>
          </div>
        </div>

        {/* Usage in settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Settings Usage</h2>
          <div className="p-4 bg-background border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Choose your preferred theme:
              </span>
              <ThemeSelector
                dictionary={dictionary}
                variant="default"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Features:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>
            • <strong>Light mode:</strong> Traditional bright theme
          </li>
          <li>
            • <strong>Dark mode:</strong> Dark theme for low-light environments
          </li>
          <li>
            • <strong>System:</strong> Automatically follows your system
            preference
          </li>
          <li>
            • <strong>Persistent:</strong> Your choice is saved in localStorage
          </li>
          <li>
            • <strong>Reactive:</strong> Responds to system theme changes when
            set to &ldquo;System&rdquo;
          </li>
        </ul>
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Usage:</h3>
        <pre className="text-sm bg-background p-4 rounded border overflow-x-auto">
          {`import { ThemeSelector } from "@/components/ThemeSelector";
import { useTheme } from "@/contexts/ThemeContext";

// Basic usage
<ThemeSelector
  dictionary={dictionary}
  variant="default"    // "default" | "minimal"
  size="md"           // "sm" | "md" | "lg"
/>

// Using the theme hook
const { theme, setTheme, resolvedTheme } = useTheme();

// Programmatically change theme
setTheme("dark");    // "light" | "dark" | "system"`}
        </pre>
      </div>
    </div>
  );
}
