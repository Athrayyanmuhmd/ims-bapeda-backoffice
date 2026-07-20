import type { TResponse, TResponseGetAll } from "@/types/response";
import { api, getError, getParams } from "@/utils/api";
import type {
  TCreateRoleRequest,
  TCreateRoleResponse,
  TGetAllRoleRequest,
  TGetAllRoleResponse,
  TGetDetailRoleResponse,
  TUpdateRoleRequest,
  TUpdateRoleResponse,
} from "./types";

export const getAllRole = async (data: TGetAllRoleRequest) => {
  try {
    const response = await api.post<TResponseGetAll<TGetAllRoleResponse>>("/roles", {
      params: getParams(data),
    });

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const getDetailRole = async (id: string) => {
  try {
    const response = await api.get<TResponse<TGetDetailRoleResponse>>(`/roles/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const createRole = async (data: TCreateRoleRequest) => {
  try {
    const response = await api.post<TResponse<TCreateRoleResponse>>("/roles/create", data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const updateRole = async (id: string, data: TUpdateRoleRequest) => {
  try {
    const response = await api.put<TResponse<TUpdateRoleResponse>>(`/roles/${id}`, data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const deleteRole = async (id: string) => {
  try {
    const response = await api.delete<TResponse<null>>(`/roles/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};
