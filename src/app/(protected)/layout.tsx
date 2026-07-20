import { redirect } from "next/navigation";
import type React from "react";
import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { TAuthUser } from "@/stores/auth";
import { getSession } from "@/utils/session";
import Providers from "@/components/auth-providers";
import { PageTransition } from "@/components/page-transition";
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

  if (!session?.accessToken || !session.user) {
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
          <section className="flex max-w-full min-w-0 flex-1 flex-col gap-4 overflow-x-hidden bg-[#FAFAFA] p-4">
            {/* useQueryBuilder (every list page) reads useSearchParams, which
                Next.js requires a Suspense boundary for in production builds —
                same reason ProgressBar is wrapped in app/layout.tsx. Missing
                this caused a client-side hook-count mismatch (React #300) on
                every page except /login and /dashboard, which don't use it. */}
            <Suspense fallback={null}>
              <PageTransition>{children}</PageTransition>
            </Suspense>
          </section>
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  );
}
