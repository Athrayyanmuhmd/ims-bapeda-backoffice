"use client";

import * as React from "react";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import type { TLoginResponse } from "@/services/auth/types";

export type TAuthIsLogin = boolean;

export type TAuthUser = TLoginResponse["user"];

interface IAuthState {
  isLogin: TAuthIsLogin;
  accessToken: string;
  user: TAuthUser | null;
}

interface IAuthStore extends IAuthState {
  setIsLogin: (isLogin: boolean) => void;
  setUser: (user: TAuthUser) => void;
  setAccessToken: (accessToken: string) => void;
}

function createStore(initial: IAuthState) {
  return create<IAuthStore>()((set) => ({
    ...initial,
    setIsLogin: (isLogin) => set({ isLogin }),
    setUser: (user) => set({ user }),
    setAccessToken: (accessToken) => set({ accessToken }),
  }));
}

// One store instance per provider (not a module-level singleton) — same
// reason as ConfigProvider: a global Zustand store would leak session data
// between requests/users on the server.
const AuthContext = React.createContext<UseBoundStore<StoreApi<IAuthStore>> | null>(null);

// Called with no selector, this returns the whole store (matching the old
// Context-based API — `const { user } = useAuth()` keeps working as-is).
// Pass a selector to subscribe to just the slice you need, e.g.
// `useAuth((s) => s.user)`, so components that only read `user` don't
// re-render when `accessToken` changes.
export function useAuth<T = IAuthStore>(selector?: (state: IAuthStore) => T): T {
  const store = React.useContext(AuthContext);

  if (!store) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return store(selector ?? ((state) => state as unknown as T));
}

type IAuthProviderProps = IAuthState & {
  children: React.ReactNode;
};

export function AuthProvider({ isLogin, accessToken, user, children }: IAuthProviderProps) {
  const [store] = React.useState(() => createStore({ isLogin, accessToken, user }));

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
}
