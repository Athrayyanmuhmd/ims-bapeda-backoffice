import { redirect } from "next/navigation";
import type React from "react";
import Providers from "@/components/auth-providers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { TAuthUser } from "@/stores/auth";
import { getSession } from "@/utils/session";
import AppHeader from "./_components/app-header";
import AppSidebar from "./_components/app-sidebar";

type TLayoutProps = {
  children: React.ReactNode;
};

// ponytail: trusts the httpOnly session cookie set at login instead of
// re-verifying the token against the backend on every navigation (that round
// trip was adding seconds to every page change). The API client's 401
// interceptor catches a genuinely expired/invalid token on the next request.
export default async function Layout({ children }: TLayoutProps) {
  const session = await getSession();

  if (!(session?.accessToken && session.user)) {
    redirect("/login");
  }

  const user = JSON.parse(session.user) as TAuthUser;

  return (
    <Providers
      auth={{
        isLogin: true,
        accessToken: session.accessToken,
        user: user,
      }}
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          {/* ponytail: PageTransition (framer-motion) + Suspense here caused a
              production-only React #300 (hook-count mismatch) on every
              navigation. Dropped both — revisit with AnimatePresence if the
              fade transition comes back, test a full nav cycle before it ships. */}
          <section className="flex max-w-full min-w-0 flex-1 flex-col gap-5 overflow-x-hidden bg-[#F4F7F8] p-4 sm:p-6">
            <div className="flex min-w-0 w-full flex-col gap-5">{children}</div>
          </section>
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  );
}
