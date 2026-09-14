import type { TResponse, TResponseGetAll } from "@/types/response";
import { api, getError, getParams } from "@/utils/api";
import type {
  TCreateLogbookRequest,
  TCreateLogbookResponse,
  TGetAllLogbookRequest,
  TGetAllLogbookResponse,
  TGetDetailLogbookResponse,
  TUpdateLogbookRequest,
  TUpdateLogbookResponse,
} from "./types";

export const getAllLogbook = async (data: TGetAllLogbookRequest) => {
  try {
    const response = await api.post<TResponseGetAll<TGetAllLogbookResponse>>("/logbook", {
      params: getParams(data),
    });

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const getDetailLogbook = async (id: string) => {
  try {
    const response = await api.get<TResponse<TGetDetailLogbookResponse>>(`/logbook/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const createLogbook = async (data: TCreateLogbookRequest) => {
  try {
    const response = await api.post<TResponse<TCreateLogbookResponse>>("/logbook/create", data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const updateLogbook = async (id: string, data: TUpdateLogbookRequest) => {
  try {
    const response = await api.put<TResponse<TUpdateLogbookResponse>>(`/logbook/${id}`, data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const deleteLogbook = async (id: string) => {
  try {
    const response = await api.delete<TResponse<null>>(`/logbook/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};
