import { redirect } from "next/navigation";
import { getPortalSession } from "@/utils/portal-session";
import LoginForm from "./_components/login-form";

export default async function Page() {
  const session = await getPortalSession();
  if (session?.accessToken) redirect("/portal");

  return (
    <main className="bg-[#FAFAFA] flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Portal Peserta Magang</h1>
          <p className="text-muted-foreground text-sm">
            Masuk untuk mencatat kehadiran dan mengisi jurnal kegiatan.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
