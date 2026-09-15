import { NextResponse } from "next/server";
import { portalPesertaCookieKey, portalTokenCookieKey } from "@/constants/session";
import { cookies } from "next/headers";

// Clears only the portal cookies — a peserta logging out must not disturb a
// staff session that happens to exist in the same browser.
export async function GET() {
  const cookieStore = await cookies();

  cookieStore.delete(portalTokenCookieKey);
  cookieStore.delete(portalPesertaCookieKey);

  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_FE_URL));
}
