import type { TResponse, TResponseGetAll } from "@/types/response";
import { api, getError, getParams } from "@/utils/api";
import type {
  TCreateAbsensiRequest,
  TCreateAbsensiResponse,
  TGetAllAbsensiRequest,
  TGetAllAbsensiResponse,
  TGetDetailAbsensiResponse,
  TUpdateAbsensiRequest,
  TUpdateAbsensiResponse,
} from "./types";

export const getAllAbsensi = async (data: TGetAllAbsensiRequest) => {
  try {
    const response = await api.post<TResponseGetAll<TGetAllAbsensiResponse>>("/absensi", {
      params: getParams(data),
    });

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const getDetailAbsensi = async (id: string) => {
  try {
    const response = await api.get<TResponse<TGetDetailAbsensiResponse>>(`/absensi/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const createAbsensi = async (data: TCreateAbsensiRequest) => {
  try {
    const response = await api.post<TResponse<TCreateAbsensiResponse>>("/absensi/create", data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const updateAbsensi = async (id: string, data: TUpdateAbsensiRequest) => {
  try {
    const response = await api.put<TResponse<TUpdateAbsensiResponse>>(`/absensi/${id}`, data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const deleteAbsensi = async (id: string) => {
  try {
    const response = await api.delete<TResponse<null>>(`/absensi/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};
