import { NextResponse } from "next/server";
import { env } from "@/constants/env";
import type { TPortalDokumen } from "@/services/portal/types";
import type { TResponse } from "@/types/response";
import { getPortalSession } from "@/utils/portal-session";
import { getSession } from "@/utils/session";
import { signedDokumenUrl } from "@/utils/storage";
import { staffOwnsDokumenPath, verifyStaffToken } from "@/utils/verify-staff-token";

// The storage bucket is private, so every read is brokered here: verify the
// JWT (cookie presence alone is not enough), then redirect to a short-lived
// signed URL. Staff must also own the dokumen in their pembimbing scope;
// portal sessions must own it via /portal/dokumen.
export async function GET(request: Request) {
  const staffSession = await getSession();
  const portalSession = await getPortalSession();

  const path = new URL(request.url).searchParams.get("path");

  // Reject traversal outright — the path comes from the query string, and the
  // signing call would happily resolve ../ segments against the bucket root.
  if (!path || path.includes("..") || path.startsWith("/")) {
    return NextResponse.json({ message: "Path file tidak valid" }, { status: 400 });
  }

  const staffToken = staffSession?.accessToken;
  const portalToken = portalSession?.accessToken;

  if (staffToken) {
    const verified = await verifyStaffToken(staffToken);
    if (verified.ok) {
      const allowed = await staffOwnsDokumenPath(staffToken, path);
      if (!allowed) {
        return NextResponse.json({ message: "Dokumen tidak ditemukan" }, { status: 404 });
      }

      const url = await signedDokumenUrl(path);
      if (!url) {
        return NextResponse.json({ message: "File tidak tersedia" }, { status: 404 });
      }
      return NextResponse.redirect(url);
    }
  }

  if (portalToken) {
    const owned = await portalOwnsPath(portalToken, path);
    if (!owned) {
      return NextResponse.json({ message: "Dokumen tidak ditemukan" }, { status: 404 });
    }

    const url = await signedDokumenUrl(path);
    if (!url) {
      return NextResponse.json({ message: "File tidak tersedia" }, { status: 404 });
    }
    return NextResponse.redirect(url);
  }

  const referer = request.headers.get("referer") ?? "";
  const target = referer.includes("/portal") ? "/portal/login" : "/login";
  return NextResponse.redirect(new URL(target, request.url));
}

async function portalOwnsPath(token: string, path: string): Promise<boolean> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_BE_URL}/portal/dokumen`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) return false;

    const body = (await response.json()) as TResponse<TPortalDokumen[]>;
    const needle = `path=${encodeURIComponent(path)}`;
    return (body.content ?? []).some(
      (doc) => doc.urlFile.includes(needle) || doc.urlFile.includes(path)
    );
  } catch {
    return false;
  }
}
