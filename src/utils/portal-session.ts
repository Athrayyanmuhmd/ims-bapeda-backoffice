"use server";

import { cookies } from "next/headers";
import { portalPesertaCookieKey, portalTokenCookieKey } from "@/constants/session";
import type { TPortalPeserta } from "@/services/portal/types";
import { sessionCookieOptions } from "@/utils/cookie-options";

export async function getPortalSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(portalTokenCookieKey)?.value;
  const peserta = cookieStore.get(portalPesertaCookieKey)?.value ?? null;

  if (!token) return null;

  return { accessToken: token, peserta };
}

export async function setPortalSession(value: { token: string; peserta: TPortalPeserta }) {
  const cookieStore = await cookies();
  const options = sessionCookieOptions();

  cookieStore.set(portalTokenCookieKey, value.token, options);
  cookieStore.set(portalPesertaCookieKey, JSON.stringify(value.peserta), options);

  return { accessToken: value.token, peserta: value.peserta };
}

export async function deletePortalSession() {
  const cookieStore = await cookies();

  cookieStore.delete(portalTokenCookieKey);
  cookieStore.delete(portalPesertaCookieKey);
}
