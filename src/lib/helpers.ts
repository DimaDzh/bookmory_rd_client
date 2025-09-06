export const interpolate = (
  template: string,
  values: Record<string, string | number>
) => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
};

/**
 * Get the current locale from the browser URL
 * Falls back to default locale if current locale is not supported
 */
export const getLocale = (): string => {
  if (typeof window !== "undefined") {
    const pathSegments = window.location.pathname.split("/");
    const locale = pathSegments[1];
    // Check if the locale is supported
    const supportedLocales = ["uk", "en"];
    return supportedLocales.includes(locale) ? locale : "uk";
  }
  return "uk"; // Default fallback
};

/**
 * Create a locale-aware path
 */
export const createLocalePath = (path: string, locale?: string): string => {
  const currentLocale = locale || getLocale();
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `/${currentLocale}/${cleanPath}`;
};
