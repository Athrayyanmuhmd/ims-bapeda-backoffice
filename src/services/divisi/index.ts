import type { TResponse, TResponseGetAll } from "@/types/response";
import { api, getError, getParams } from "@/utils/api";
import type {
  TCreateDivisiRequest,
  TCreateDivisiResponse,
  TGetAllDivisiRequest,
  TGetAllDivisiResponse,
  TGetDetailDivisiResponse,
  TUpdateDivisiRequest,
  TUpdateDivisiResponse,
} from "./types";

export const getAllDivisi = async (data: TGetAllDivisiRequest) => {
  try {
    const response = await api.post<TResponseGetAll<TGetAllDivisiResponse>>("/divisi", {
      params: getParams(data),
    });

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const getDetailDivisi = async (id: string) => {
  try {
    const response = await api.get<TResponse<TGetDetailDivisiResponse>>(`/divisi/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const createDivisi = async (data: TCreateDivisiRequest) => {
  try {
    const response = await api.post<TResponse<TCreateDivisiResponse>>("/divisi/create", data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const updateDivisi = async (id: string, data: TUpdateDivisiRequest) => {
  try {
    const response = await api.put<TResponse<TUpdateDivisiResponse>>(`/divisi/${id}`, data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const deleteDivisi = async (id: string) => {
  try {
    const response = await api.delete<TResponse<null>>(`/divisi/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};
