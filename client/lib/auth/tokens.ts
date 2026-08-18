import "server-only";
import { cookies } from "next/headers";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function setAuthCookies(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  const cookieStore = await cookies();
  const shared = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };

  try {
    cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, shared);
    cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, shared);
  } catch {}
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  try {
    cookieStore.delete(ACCESS_TOKEN_COOKIE);
    cookieStore.delete(REFRESH_TOKEN_COOKIE);
  } catch {}
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}
