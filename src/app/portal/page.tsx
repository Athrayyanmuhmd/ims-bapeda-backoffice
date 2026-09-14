import { redirect } from "next/navigation";
import type { TPortalPeserta } from "@/services/portal/types";
import { getPortalSession } from "@/utils/portal-session";
import Container from "./_components/container";

// Same trade-off as the backoffice layout: trusts the httpOnly portal cookie
// instead of re-verifying against the API on every navigation. The portal API
// client's 401/403 interceptor catches a dead session on the next request.
//
// QueryClient and Toaster come from the root layout, so nothing extra is wrapped
// here.
export default async function Page() {
  const session = await getPortalSession();

  if (!session?.accessToken || !session.peserta) {
    redirect("/portal/login");
  }

  const peserta = JSON.parse(session.peserta) as TPortalPeserta;

  return <Container peserta={peserta} />;
}
