import { default as _axios, type AxiosError } from "axios";
import { env } from "@/constants/env";
import type { TResponse } from "@/types/response";
import { getError } from "@/utils/api";
import { deletePortalSession, getPortalSession } from "@/utils/portal-session";
import type {
  TPortalAbsensi,
  TPortalCheckInWindow,
  TPortalDokumen,
  TPortalIzinRequest,
  TPortalLogbook,
  TPortalLogbookRequest,
  TPortalLoginRequest,
  TPortalLoginResponse,
  TPortalPenilaian,
  TPortalPeserta,
} from "./types";

// A separate axios instance from `api`: the portal carries a different token
// from a different cookie, and on 401 it must return to the portal login rather
// than the backoffice one.
const portalApi = _axios.create({ baseURL: `${env.NEXT_PUBLIC_BE_URL}/portal` });

portalApi.interceptors.request.use(async (config) => {
  const session = await getPortalSession();

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

portalApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // 403 too, not just 401: the backend returns it when portal access is
    // revoked or the magang ends, and the session is equally dead either way.
    const status = error.response?.status;
    if ((status === 401 || status === 403) && typeof window !== "undefined") {
      const url = error.config?.url ?? "";
      if (url.includes("/login")) return Promise.reject(error);
      await deletePortalSession();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const unwrap = async <T>(request: Promise<{ data: TResponse<T> }>) => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const login = (data: TPortalLoginRequest) =>
  unwrap(portalApi.post<TResponse<TPortalLoginResponse>>("/login", data));

export const getProfile = () => unwrap(portalApi.get<TResponse<TPortalPeserta>>("/me"));

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  unwrap(portalApi.post<TResponse<null>>("/change-password", data));

export const getAbsensi = (rows = 100) =>
  unwrap(portalApi.get<TResponse<TPortalAbsensi[]>>("/absensi", { params: { rows } }));

export const getTodayAbsensi = () =>
  unwrap(portalApi.get<TResponse<TPortalAbsensi | null>>("/absensi/today"));

export const checkIn = () => unwrap(portalApi.post<TResponse<TPortalAbsensi>>("/absensi/check-in"));

export const checkOut = () =>
  unwrap(portalApi.post<TResponse<TPortalAbsensi>>("/absensi/check-out"));

export const getCheckInWindow = () =>
  unwrap(portalApi.get<TResponse<TPortalCheckInWindow>>("/absensi/check-in-window"));

export const reportIzin = (data: TPortalIzinRequest) =>
  unwrap(portalApi.post<TResponse<TPortalAbsensi>>("/absensi/izin", data));

export const getLogbook = () => unwrap(portalApi.get<TResponse<TPortalLogbook[]>>("/logbook"));

export const createLogbook = (data: TPortalLogbookRequest) =>
  unwrap(portalApi.post<TResponse<TPortalLogbook>>("/logbook", data));

export const updateLogbook = (id: string, kegiatan: string) =>
  unwrap(portalApi.put<TResponse<TPortalLogbook>>(`/logbook/${id}`, { kegiatan }));

export const getPenilaian = () =>
  unwrap(portalApi.get<TResponse<TPortalPenilaian[]>>("/penilaian"));

export const getDokumen = () => unwrap(portalApi.get<TResponse<TPortalDokumen[]>>("/dokumen"));
