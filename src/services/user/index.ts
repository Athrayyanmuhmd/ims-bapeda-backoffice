import type { TResponse, TResponseGetAll } from "@/types/response";
import { api, getError, getParams } from "@/utils/api";
import type {
  TCreateUserRequest,
  TCreateUserResponse,
  TGetAllUserRequest,
  TGetAllUserResponse,
  TGetDetailUserResponse,
  TUpdateUserRequest,
  TUpdateUserResponse,
} from "./types";

export const getAllUser = async (data: TGetAllUserRequest) => {
  try {
    const response = await api.post<TResponseGetAll<TGetAllUserResponse>>("/users", {
      params: getParams(data),
    });

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const getDetailUser = async (id: string) => {
  try {
    const response = await api.get<TResponse<TGetDetailUserResponse>>(`/users/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const createUser = async (data: TCreateUserRequest) => {
  try {
    const response = await api.post<TResponse<TCreateUserResponse>>("/users/create", data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const updateUser = async (id: string, data: TUpdateUserRequest) => {
  try {
    const response = await api.put<TResponse<TUpdateUserResponse>>(`/users/${id}`, data);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await api.delete<TResponse<null>>(`/users/${id}`);

    return response.data;
  } catch (error) {
    throw getError(error);
  }
};
