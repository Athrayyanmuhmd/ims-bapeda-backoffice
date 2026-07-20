import type { TResponse, TResponseGetAll } from "@/types/response";
import { api, getError, getParams } from "@/utils/api";
import type {
  TCreatePenilaianRequest,
  TCreatePenilaianResponse,
  TGetAllPenilaianRequest,
  TGetAllPenilaianResponse,
  TGetDetailPenilaianResponse,
  TUpdatePenilaianRequest,
  TUpdatePenilaianResponse,
} from "./types";

export const getAllPenilaian = async (data: TGetAllPenilaianRequest) => {
  try {
    const response = await api.post<TResponseGetAll<TGetAllPenilaianResponse>>("/penilaian", {
      params: getParams(data),
    });

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const getDetailPenilaian = async (id: string) => {
  try {
    const response = await api.get<TResponse<TGetDetailPenilaianResponse>>(`/penilaian/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const createPenilaian = async (data: TCreatePenilaianRequest) => {
  try {
    const response = await api.post<TResponse<TCreatePenilaianResponse>>("/penilaian/create", data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const updatePenilaian = async (id: string, data: TUpdatePenilaianRequest) => {
  try {
    const response = await api.put<TResponse<TUpdatePenilaianResponse>>(`/penilaian/${id}`, data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const deletePenilaian = async (id: string) => {
  try {
    const response = await api.delete<TResponse<null>>(`/penilaian/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};
