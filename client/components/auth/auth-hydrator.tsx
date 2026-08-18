"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { CurrentUser } from "@/lib/auth/session";

export function AuthHydrator({ user }: { user: CurrentUser | null }) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    setUser(user);
  }, [user?.id]);

  return null;
}
