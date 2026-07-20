import { default as _axios, type AxiosError } from "axios";
import { env } from "@/constants/env";
import type { TPaginationRequest } from "@/types/request";
import { deleteSession, getSession } from "./session";

export const api = _axios.create({
  baseURL: env.NEXT_PUBLIC_BE_URL,
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

// Layouts trust the session cookie without re-verifying it on every
// navigation (see (protected)/layout.tsx), so this is what actually catches
// a genuinely expired/invalid token — on the first request that hits it.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      await deleteSession();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const getError = (error: AxiosError | unknown) => {
  if (_axios.isAxiosError(error)) {
    return {
      content: error.response?.data?.content || null,
      message: error.response?.data?.message || "Something went wrong",
      errors: error.response?.data?.errors || [],
      status: error.response?.status,
    };
  }

  return { message: "Something went wrong", status: undefined };
};

export const getParams = (params: TPaginationRequest) => {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append("page", params?.page.toString());
  }
  if (params?.rows) {
    queryParams.append("rows", params?.rows.toString());
  }
  if (params?.searchFilters) {
    queryParams.append("searchFilters", JSON.stringify(params.searchFilters));
  }
  if (params?.filters) {
    queryParams.append("filters", JSON.stringify(params.filters));
  }
  if (params?.orderKey) {
    queryParams.append("orderKey", params?.orderKey);
  }
  if (params?.orderRule) {
    queryParams.append("orderRule", params?.orderRule);
  }

  return queryParams.toString();
};

export const transformParams = (params?: TPaginationRequest) => {
  return Object.entries(params || {}).reduce(
    (acc, [key, value]) => {
      if (typeof value === "object") {
        acc[key] = JSON.stringify(value);
      } else {
        acc[key] = value?.toString();
      }

      return acc;
    },
    {} as Record<string, string>
  );
};
