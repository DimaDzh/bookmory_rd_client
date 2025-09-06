"use server";

import { cookies } from "next/headers";

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set("auth_token", token, {
    httpOnly: false, // Allow JavaScript access
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { success: true };
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();

  cookieStore.delete("auth_token");

  return { success: true };
}

export async function getAuthCookie() {
  const cookieStore = await cookies();

  return cookieStore.get("auth_token")?.value;
}
