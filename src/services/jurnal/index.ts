import type { TResponse, TResponseGetAll } from "@/types/response";
import { api, getError, getParams } from "@/utils/api";
import type {
  TCreateJurnalRequest,
  TCreateJurnalResponse,
  TGetAllJurnalRequest,
  TGetAllJurnalResponse,
  TGetDetailJurnalResponse,
  TUpdateJurnalRequest,
  TUpdateJurnalResponse,
} from "./types";

export const getAllJurnal = async (data: TGetAllJurnalRequest) => {
  try {
    const response = await api.post<TResponseGetAll<TGetAllJurnalResponse>>("/jurnal", {
      params: getParams(data),
    });

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const getDetailJurnal = async (id: string) => {
  try {
    const response = await api.get<TResponse<TGetDetailJurnalResponse>>(`/jurnal/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const createJurnal = async (data: TCreateJurnalRequest) => {
  try {
    const response = await api.post<TResponse<TCreateJurnalResponse>>("/jurnal/create", data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const updateJurnal = async (id: string, data: TUpdateJurnalRequest) => {
  try {
    const response = await api.put<TResponse<TUpdateJurnalResponse>>(`/jurnal/${id}`, data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const deleteJurnal = async (id: string) => {
  try {
    const response = await api.delete<TResponse<null>>(`/jurnal/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};
