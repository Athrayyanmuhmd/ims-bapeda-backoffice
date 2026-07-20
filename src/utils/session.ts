"use server";

import { cookies } from "next/headers";
import { tokenCookieKey, userCookieKey } from "@/constants/session";
import type { TLoginResponse } from "@/services/auth/types";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(tokenCookieKey)?.value;
  const user = cookieStore.get(userCookieKey)?.value ?? null;

  if (!token) return null;

  return {
    accessToken: token,
    user: user,
  };
}

export async function setSession(value: TLoginResponse) {
  const token = value.token;
  const user = value.user;

  const cookieStore = await cookies();

  cookieStore.set(tokenCookieKey, token, {
    httpOnly: true,
  });

  cookieStore.set(userCookieKey, JSON.stringify(user), {
    httpOnly: true,
  });

  return {
    accessToken: token,
    user: user,
  };
}

export async function deleteSession() {
  const cookieStore = await cookies();

  if (cookieStore.get(tokenCookieKey) && cookieStore.get(userCookieKey)) {
    cookieStore.delete(tokenCookieKey);
    cookieStore.delete(userCookieKey);
  }
}
