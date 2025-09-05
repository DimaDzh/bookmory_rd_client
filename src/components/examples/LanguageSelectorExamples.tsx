"use client";

import { LanguageSelector } from "@/components/LanguageSelector";
import { getDictionary, Dictionary } from "@/lib/dictionaries";
import { useEffect, useState } from "react";

interface LanguageSelectorExamplesProps {
  currentLocale: string;
}

export function LanguageSelectorExamples({
  currentLocale,
}: LanguageSelectorExamplesProps) {
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);

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
        <h1 className="text-3xl font-bold mb-2">Language Selector Examples</h1>
        <p className="text-gray-600">
          Different variants and sizes of the LanguageSelector component
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Default variant */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Default Variant</h2>
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 mb-2">Small size:</p>
              <LanguageSelector
                currentLocale={currentLocale}
                dictionary={dictionary}
                variant="default"
                size="sm"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Medium size (default):
              </p>
              <LanguageSelector
                currentLocale={currentLocale}
                dictionary={dictionary}
                variant="default"
                size="md"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Large size:</p>
              <LanguageSelector
                currentLocale={currentLocale}
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
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 mb-2">Small size:</p>
              <LanguageSelector
                currentLocale={currentLocale}
                dictionary={dictionary}
                variant="minimal"
                size="sm"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Medium size:</p>
              <LanguageSelector
                currentLocale={currentLocale}
                dictionary={dictionary}
                variant="minimal"
                size="md"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Large size:</p>
              <LanguageSelector
                currentLocale={currentLocale}
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
          <div className="p-4 bg-white border rounded-lg">
            <nav className="flex justify-between items-center p-4 bg-gray-800 text-white rounded">
              <div className="text-lg font-bold">BookMory</div>
              <LanguageSelector
                currentLocale={currentLocale}
                dictionary={dictionary}
                variant="minimal"
                size="sm"
              />
            </nav>
          </div>
        </div>

        {/* Usage in dropdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Inline Usage</h2>
          <div className="p-4 bg-white border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Choose your preferred language:
              </span>
              <LanguageSelector
                currentLocale={currentLocale}
                dictionary={dictionary}
                variant="default"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Usage:</h3>
        <pre className="text-sm bg-white p-4 rounded border overflow-x-auto">
          {`import { LanguageSelector } from "@/components/LanguageSelector";

// Default usage
<LanguageSelector
  currentLocale={locale}
  dictionary={dictionary}
  variant="default"  // "default" | "minimal"
  size="md"         // "sm" | "md" | "lg"
/>

// Minimal variant for headers
<LanguageSelector
  currentLocale={locale}
  dictionary={dictionary}
  variant="minimal"
  size="sm"
/>`}
        </pre>
      </div>
    </div>
  );
}
