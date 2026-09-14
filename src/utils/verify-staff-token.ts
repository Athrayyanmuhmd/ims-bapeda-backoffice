import { env } from "@/constants/env";
import type { TResponse } from "@/types/response";

type VerifyOk = { ok: true; role: string | null };
type VerifyFail = { ok: false };

// Asks the API to cryptographically verify the JWT and reload live user status.
// Presence of a cookie alone is never enough for dokumen upload/download.
export async function verifyStaffToken(token: string): Promise<VerifyOk | VerifyFail> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_BE_URL}/verify-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });

    if (!response.ok) return { ok: false };

    const body = (await response.json()) as TResponse<{ user: { role: string | null } }>;
    return { ok: true, role: body.content?.user?.role ?? null };
  } catch {
    return { ok: false };
  }
}

export async function staffOwnsDokumenPath(token: string, path: string): Promise<boolean> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_BE_URL}/dokumen/authorize-file`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}
