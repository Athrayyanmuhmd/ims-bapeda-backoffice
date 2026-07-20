import type { TResponse, TResponseGetAll } from "@/types/response";
import { api, getError, getParams } from "@/utils/api";
import type {
  TCreatePesertaMagangRequest,
  TCreatePesertaMagangResponse,
  TGetAllPesertaMagangRequest,
  TGetAllPesertaMagangResponse,
  TGetDetailPesertaMagangResponse,
  TUpdatePesertaMagangRequest,
  TUpdatePesertaMagangResponse,
} from "./types";

export const getAllPesertaMagang = async (data: TGetAllPesertaMagangRequest) => {
  try {
    const response = await api.post<TResponseGetAll<TGetAllPesertaMagangResponse>>(
      "/peserta-magang",
      { params: getParams(data) }
    );

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const getDetailPesertaMagang = async (id: string) => {
  try {
    const response = await api.get<TResponse<TGetDetailPesertaMagangResponse>>(
      `/peserta-magang/${id}`
    );

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const createPesertaMagang = async (data: TCreatePesertaMagangRequest) => {
  try {
    const response = await api.post<TResponse<TCreatePesertaMagangResponse>>(
      "/peserta-magang/create",
      data
    );

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const updatePesertaMagang = async (id: string, data: TUpdatePesertaMagangRequest) => {
  try {
    const response = await api.put<TResponse<TUpdatePesertaMagangResponse>>(
      `/peserta-magang/${id}`,
      data
    );

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const deletePesertaMagang = async (id: string) => {
  try {
    const response = await api.delete<TResponse<null>>(`/peserta-magang/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};
