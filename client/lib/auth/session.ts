import "server-only";
import { api } from "@/lib/api/client";
import {
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "./tokens";

export type CurrentUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "USER" | "ADMIN" | "DRIVER";
};

async function fetchMe(accessToken: string): Promise<CurrentUser | null> {
  const { data, error } = await api.GET("/api/v1/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role,
  };
}

async function refreshSession(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const { data, error } = await api.POST("/api/v1/auth/refresh", {
    headers: { Authorization: `Bearer ${refreshToken}` },
  });

  if (error || !data) {
    await clearAuthCookies();
    return null;
  }

  await setAuthCookies(data);
  return data.accessToken;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const user = await fetchMe(accessToken);
  if (user) return user;

  const refreshedToken = await refreshSession();
  if (!refreshedToken) return null;

  return fetchMe(refreshedToken);
}
