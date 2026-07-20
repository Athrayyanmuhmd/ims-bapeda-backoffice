import type { TResponse, TResponseGetAll } from "@/types/response";
import { api, getError, getParams } from "@/utils/api";
import type {
  TCreateInstansiRequest,
  TCreateInstansiResponse,
  TGetAllInstansiRequest,
  TGetAllInstansiResponse,
  TGetDetailInstansiResponse,
  TUpdateInstansiRequest,
  TUpdateInstansiResponse,
} from "./types";

export const getAllInstansi = async (data: TGetAllInstansiRequest) => {
  try {
    const response = await api.post<TResponseGetAll<TGetAllInstansiResponse>>("/instansi", {
      params: getParams(data),
    });

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const getDetailInstansi = async (id: string) => {
  try {
    const response = await api.get<TResponse<TGetDetailInstansiResponse>>(`/instansi/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const createInstansi = async (data: TCreateInstansiRequest) => {
  try {
    const response = await api.post<TResponse<TCreateInstansiResponse>>("/instansi/create", data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const updateInstansi = async (id: string, data: TUpdateInstansiRequest) => {
  try {
    const response = await api.put<TResponse<TUpdateInstansiResponse>>(`/instansi/${id}`, data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const deleteInstansi = async (id: string) => {
  try {
    const response = await api.delete<TResponse<null>>(`/instansi/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};
