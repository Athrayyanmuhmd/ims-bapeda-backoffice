import type { TResponse, TResponseGetAll } from "@/types/response";
import { api, getError, getParams } from "@/utils/api";
import type {
  TCreateDokumenRequest,
  TCreateDokumenResponse,
  TGetAllDokumenRequest,
  TGetAllDokumenResponse,
  TGetDetailDokumenResponse,
  TUploadDokumenResponse,
} from "./types";

export const getAllDokumen = async (data: TGetAllDokumenRequest) => {
  try {
    const response = await api.post<TResponseGetAll<TGetAllDokumenResponse>>("/dokumen", {
      params: getParams(data),
    });

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const getDetailDokumen = async (id: string) => {
  try {
    const response = await api.get<TResponse<TGetDetailDokumenResponse>>(`/dokumen/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const createDokumen = async (data: TCreateDokumenRequest) => {
  try {
    const response = await api.post<TResponse<TCreateDokumenResponse>>("/dokumen/create", data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

// Hits this app's own route handler, not the API backend — so it uses fetch
// rather than the `api` axios instance (no bearer token needed, the session
// cookie is already sent).
export const uploadDokumenFile = async (file: File) => {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/dokumen/upload", { method: "POST", body });
  const data = (await response.json()) as TUploadDokumenResponse & { message?: string };

  if (!response.ok) {
    throw { message: data.message ?? "Gagal mengunggah file" };
  }

  return data;
};

export const deleteDokumen = async (id: string) => {
  try {
    const response = await api.delete<TResponse<null>>(`/dokumen/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};
