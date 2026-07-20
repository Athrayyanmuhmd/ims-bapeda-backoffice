"use client";

import type React from "react";
import { AuthProvider, type TAuthIsLogin, type TAuthUser } from "@/stores/auth";

type TAuthProvidersProps = {
  children: React.ReactNode;
  auth: {
    isLogin: TAuthIsLogin;
    accessToken: string;
    user: TAuthUser | null;
  };
};

export default function AuthProviders({ children, auth }: TAuthProvidersProps) {
  return (
    <AuthProvider isLogin={auth?.isLogin} accessToken={auth?.accessToken} user={auth?.user}>
      {children}
    </AuthProvider>
  );
}
