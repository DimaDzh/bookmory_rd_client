import Cookies from "js-cookie";

interface CookieOptions {
  expires?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  expires: 7, // 7 days
  path: "/",
  secure: false, // Disable secure for local development/Docker
  sameSite: "lax", // Changed to 'lax' for better compatibility with navigation
  // Don't set domain explicitly to allow it to work with different hosts
  domain: undefined,
};

export const cookieManager = {
  set: (name: string, value: string, options: CookieOptions = {}) => {
    const finalOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options };

    try {
      Cookies.set(name, value, finalOptions);

      // Verify the cookie was set
      const verified = Cookies.get(name);
      if (!verified) {
        console.warn(
          `Cookie ${name} was not set properly, trying with relaxed settings`
        );

        // Fallback with more permissive settings
        const fallbackOptions = {
          ...finalOptions,
          sameSite: "lax" as const,
          secure: false,
        };

        Cookies.set(name, value, fallbackOptions);
      }
    } catch (error) {
      console.error("Error setting cookie:", error);

      // Last resort: set with minimal options
      try {
        Cookies.set(name, value, { expires: 7, path: "/" });
      } catch (fallbackError) {
        console.error(
          "Failed to set cookie even with fallback:",
          fallbackError
        );
      }
    }
  },

  get: (name: string): string | undefined => {
    try {
      return Cookies.get(name);
    } catch (error) {
      console.error("Error getting cookie:", error);
      return undefined;
    }
  },

  remove: (name: string, options: Omit<CookieOptions, "expires"> = {}) => {
    const finalOptions = {
      path: DEFAULT_COOKIE_OPTIONS.path,
      domain: DEFAULT_COOKIE_OPTIONS.domain,
      ...options,
    };

    try {
      Cookies.remove(name, finalOptions);

      // Try alternative removal methods if the first doesn't work
      if (Cookies.get(name)) {
        console.warn(`Cookie ${name} still exists, trying alternative removal`);

        // Try without domain
        Cookies.remove(name, { path: finalOptions.path });

        // Try with different path
        if (Cookies.get(name)) {
          Cookies.remove(name);
        }
      }
    } catch (error) {
      console.error("Error removing cookie:", error);
    }
  },

  exists: (name: string): boolean => {
    return cookieManager.get(name) !== undefined;
  },
};

export default cookieManager;
