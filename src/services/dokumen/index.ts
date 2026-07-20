import type { TResponse, TResponseGetAll } from "@/types/response";
import { api, getError, getParams } from "@/utils/api";
import type {
  TCreateDokumenRequest,
  TCreateDokumenResponse,
  TGetAllDokumenRequest,
  TGetAllDokumenResponse,
  TGetDetailDokumenResponse,
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

export const deleteDokumen = async (id: string) => {
  try {
    const response = await api.delete<TResponse<null>>(`/dokumen/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};
