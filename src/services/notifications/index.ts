import type { TResponse } from "@/types/response";
import { api, getError } from "@/utils/api";

export type TNotificationSummary = {
  endingSoon: {
    id: string;
    name: string;
    divisi: string | null;
    tanggalSelesai: string;
    daysLeft: number;
  }[];
  belumAbsen: {
    id: string;
    name: string;
    divisi: string | null;
  }[];
  pendingIzin: {
    id: string;
    pesertaMagangId: string;
    name: string;
    divisi: string | null;
    jenis: string;
    keterangan: string | null;
    tanggal: string;
  }[];
  counts: {
    endingSoon: number;
    belumAbsen: number;
    pendingIzin: number;
  };
};

export const getSummary = async () => {
  try {
    const response = await api.get<TResponse<TNotificationSummary>>("/notifications/summary");
    return response.data;
  } catch (error) {
    throw getError(error);
  }
};
