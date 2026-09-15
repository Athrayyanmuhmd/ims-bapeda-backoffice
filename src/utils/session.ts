"use server";

import { cookies } from "next/headers";
import { tokenCookieKey, userCookieKey } from "@/constants/session";
import type { TLoginResponse } from "@/services/auth/types";
import { sessionCookieOptions } from "@/utils/cookie-options";

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
  const options = sessionCookieOptions();

  const cookieStore = await cookies();

  cookieStore.set(tokenCookieKey, token, options);
  cookieStore.set(userCookieKey, JSON.stringify(user), options);

  return {
    accessToken: token,
    user: user,
  };
}

/** Keep the JWT; refresh only the user payload after self-service profile edits. */
export async function updateSessionUser(user: TLoginResponse["user"]) {
  const cookieStore = await cookies();
  const options = sessionCookieOptions();
  cookieStore.set(userCookieKey, JSON.stringify(user), options);
  return user;
}

export async function deleteSession() {
  const cookieStore = await cookies();

  if (cookieStore.get(tokenCookieKey) && cookieStore.get(userCookieKey)) {
    cookieStore.delete(tokenCookieKey);
    cookieStore.delete(userCookieKey);
  }
}
