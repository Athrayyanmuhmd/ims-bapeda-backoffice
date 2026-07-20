import { z } from "zod";
import type { TPaginationRequest } from "@/types/request";

const schemaPenilaian = z.object({
  id: z.string(),
  pesertaMagangId: z.string(),
  name: z.string(),
  divisi: z.string().nullable(),
  penilai: z.string(),
  nilai: z.number(),
  komentar: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TPenilaian = z.infer<typeof schemaPenilaian>;

export type TGetAllPenilaianRequest = TPaginationRequest;
export const schemaGetAllPenilaianResponse = schemaPenilaian;
export type TGetAllPenilaianResponse = z.infer<typeof schemaGetAllPenilaianResponse>;

export type TGetDetailPenilaianResponse = TPenilaian;

export const schemaCreatePenilaianRequest = z.object({
  pesertaMagangId: z.string().min(1, "Peserta magang wajib dipilih"),
  nilai: z.number().min(0, "Nilai minimal 0").max(100, "Nilai maksimal 100"),
  komentar: z.string().optional(),
});

export type TCreatePenilaianRequest = z.infer<typeof schemaCreatePenilaianRequest>;
export type TCreatePenilaianResponse = TPenilaian;

export const schemaUpdatePenilaianRequest = schemaCreatePenilaianRequest.omit({ pesertaMagangId: true });
export type TUpdatePenilaianRequest = z.infer<typeof schemaUpdatePenilaianRequest>;
export type TUpdatePenilaianResponse = TPenilaian;
