import { redirect } from "next/navigation";
import type { TPortalPeserta } from "@/services/portal/types";
import { getPortalSession } from "@/utils/portal-session";
import KehadiranCalendar from "./_components/calendar";

export default async function Page() {
  const session = await getPortalSession();

  if (!session?.accessToken || !session.peserta) {
    redirect("/login");
  }

  const peserta = JSON.parse(session.peserta) as TPortalPeserta;

  return <KehadiranCalendar peserta={peserta} />;
}
