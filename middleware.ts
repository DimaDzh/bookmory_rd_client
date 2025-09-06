import { i18nRouter } from "next-i18n-router";
import i18nConfig from "./i18nConfig";
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // First handle i18n routing
  const i18nResponse = i18nRouter(request, i18nConfig);

  // Get auth token from cookies
  const authToken = request.cookies.get("auth_token")?.value;

  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/library", "/profile"];

  // Define public routes that should redirect to dashboard if authenticated
  const publicRoutes = ["/login", "/register"];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.includes(route)
  );

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname.includes(route));

  // Extract locale from pathname
  const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/);
  const locale = localeMatch ? localeMatch[1] : i18nConfig.defaultLocale;

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing public route with valid token
  if (isPublicRoute && authToken) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // For root path, redirect based on auth status
  if (pathname === "/" || pathname === `/${locale}`) {
    if (authToken) {
      const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
      return NextResponse.redirect(dashboardUrl);
    } else {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return i18nResponse;
}

// only applies this middleware to files in the app directory
export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)",
};
