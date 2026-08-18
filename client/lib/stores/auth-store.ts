import { create } from "zustand";
import * as authActions from "@/lib/auth/actions";
import type { CurrentUser } from "@/lib/auth/session";

interface AuthState {
  user: CurrentUser | null;
  isLoading: boolean;

  setUser: (user: CurrentUser | null) => void;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

function splitName(fullName: string) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  const lastName = rest.join(" ");
  return { firstName, lastName: lastName || undefined };
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),

  signIn: async (email, password) => {
    set({ isLoading: true });
    const result = await authActions.login({ email, password });
    if (result.user) set({ user: result.user });
    set({ isLoading: false });
    return { error: result.error };
  },

  signUp: async (email, password, fullName) => {
    set({ isLoading: true });
    const result = await authActions.register({
      email,
      password,
      ...splitName(fullName),
    });
    if (result.user) set({ user: result.user });
    set({ isLoading: false });
    return { error: result.error };
  },

  signOut: async () => {
    set({ isLoading: true });
    await authActions.logout();
    set({ user: null, isLoading: false });
  },
}));
