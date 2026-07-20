import type { TResponse } from "@/types/response";
import { api, getError } from "@/utils/api";
import type { TLoginRequest, TLoginResponse } from "./types";

const login = () => ({
  mutationFn: async (data: TLoginRequest) => {
    try {
      const response = await api.post<TResponse<TLoginResponse>>("/login", data);

      return response.data;
    } catch (error) {
      throw getError(error);
    }
  },
});

export { login };
