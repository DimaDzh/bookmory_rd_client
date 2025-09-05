"use client";

import { ThemeSelector } from "@/components/ThemeSelector";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDictionary, Dictionary } from "@/lib/dictionaries";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { BookOpen, Search, Star, Clock, CheckCircle } from "lucide-react";

interface ThemeShowcaseProps {
  currentLocale: string;
}

export function ThemeShowcase({ currentLocale }: ThemeShowcaseProps) {
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background transition-colors">
      {/* Enhanced Navigation Bar */}
      <nav className="nav-enhanced sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary dark:text-primary" />
              <span className="text-xl font-bold text-themed">BookMory</span>
              <Badge variant="outline" className="text-xs">
                Theme: {theme} {theme === "system" && `(${resolvedTheme})`}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSelector
                dictionary={dictionary}
                variant="minimal"
                size="sm"
              />
              <LanguageSelector
                currentLocale={currentLocale}
                dictionary={dictionary}
                variant="minimal"
                size="sm"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-themed mb-4">
            Enhanced Theme System
          </h1>
          <p className="text-xl text-muted-themed mb-8">
            Beautiful light and dark modes with seamless transitions
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <ThemeSelector
              dictionary={dictionary}
              variant="default"
              size="sm"
            />
            <ThemeSelector
              dictionary={dictionary}
              variant="default"
              size="md"
            />
            <ThemeSelector
              dictionary={dictionary}
              variant="default"
              size="lg"
            />
          </div>
        </div>
      </section>

      {/* Component Showcase */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-themed mb-8 text-center">
            Component Showcase
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Enhanced Cards */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-themed flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Book Card
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-themed">
                  Enhanced card with proper dark mode support
                </p>
                <div className="flex gap-2">
                  <Badge className="status-badge-reading">Reading</Badge>
                  <Badge className="status-badge-finished">Finished</Badge>
                </div>
                <Button className="w-full btn-hover-enhanced">
                  <Star className="h-4 w-4 mr-2" />
                  Add to Favorites
                </Button>
              </CardContent>
            </Card>

            {/* Form Components */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-themed">Form Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-themed">Search Books</Label>
                  <Input
                    className="input-enhanced"
                    placeholder="Enter book title..."
                  />
                </div>
                <Button variant="outline" className="w-full btn-hover-enhanced">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </CardContent>
            </Card>

            {/* Status Cards */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-themed">Reading Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-themed">Want to Read</span>
                  <Badge className="status-badge-want-to-read">5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-themed">Currently Reading</span>
                  <Badge className="status-badge-reading">3</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-themed">Finished</span>
                  <Badge className="status-badge-finished">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-themed">Paused</span>
                  <Badge className="status-badge-paused">1</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-themed flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Reading Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-themed">Current Book</span>
                    <span className="text-themed">75%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Progress
                </Button>
              </CardContent>
            </Card>

            {/* Theme Info */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-themed">Theme Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-themed">Selected Theme:</span>
                  <span className="text-themed capitalize">{theme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-themed">Resolved Theme:</span>
                  <span className="text-themed capitalize">
                    {resolvedTheme}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-themed">Auto System:</span>
                  <span className="text-themed">
                    {theme === "system" ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-themed">Persistent:</span>
                  <span className="text-themed">LocalStorage</span>
                </div>
              </CardContent>
            </Card>

            {/* Color Palette */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-themed">Color Palette</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <div className="w-full h-8 bg-primary rounded"></div>
                  <span className="text-xs text-muted-themed">Primary</span>
                </div>
                <div className="space-y-1">
                  <div className="w-full h-8 bg-secondary rounded"></div>
                  <span className="text-xs text-muted-themed">Secondary</span>
                </div>
                <div className="space-y-1">
                  <div className="w-full h-8 bg-accent rounded"></div>
                  <span className="text-xs text-muted-themed">Accent</span>
                </div>
                <div className="space-y-1">
                  <div className="w-full h-8 bg-destructive rounded"></div>
                  <span className="text-xs text-muted-themed">Destructive</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 border-t border-border dark:border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-themed mb-6">
            Theme System Features
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-themed">
                Auto System Detection
              </h3>
              <p className="text-muted-themed">
                Automatically follows your system preference
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-themed">
                Persistent Storage
              </h3>
              <p className="text-muted-themed">
                Remembers your choice across sessions
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-themed">
                Smooth Transitions
              </h3>
              <p className="text-muted-themed">
                Seamless switching between themes
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
