import { redirect } from "next/navigation";
import type React from "react";
import { getSession } from "@/utils/session";
import Providers from "@/components/auth-providers";

type TLayoutProps = {
  children: React.ReactNode;
};

// ponytail: trusts the session cookie instead of re-verifying against the
// backend on every visit to /login — see (protected)/layout.tsx for why.
export default async function Layout({ children }: TLayoutProps) {
  const session = await getSession();

  if (session?.accessToken && session.user) {
    redirect("/dashboard");
  }

  return (
    <Providers
      auth={{
        isLogin: false,
        accessToken: "",
        user: null,
      }}
    >
      {children}
    </Providers>
  );
}
