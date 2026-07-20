"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { tokenCookieKey, userCookieKey } from "@/constants/session";

export async function GET() {
  const cookieStore = await cookies();

  cookieStore.delete(tokenCookieKey);
  cookieStore.delete(userCookieKey);

  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_FE_URL));
}
