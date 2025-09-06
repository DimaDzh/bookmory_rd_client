import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "books.google.com",
        pathname: "/books/**",
      },
      {
        protocol: "https",
        hostname: "books.google.com",
        pathname: "/books/content/**",
      },
    ],
  },
  // Ensure i18n routing works with standalone mode
  trailingSlash: false,
  // Add experimental features for better standalone support
  experimental: {
    optimizePackageImports: ["js-cookie", "next-themes", "lucide-react"],
  },
};

export default nextConfig;
