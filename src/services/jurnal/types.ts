import { z } from "zod";
import type { TPaginationRequest } from "@/types/request";

const schemaJurnal = z.object({
  id: z.string(),
  pesertaMagangId: z.string(),
  name: z.string(),
  divisi: z.string().nullable(),
  tanggal: z.string(),
  kegiatan: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TJurnal = z.infer<typeof schemaJurnal>;

export type TGetAllJurnalRequest = TPaginationRequest;
export const schemaGetAllJurnalResponse = schemaJurnal;
export type TGetAllJurnalResponse = z.infer<typeof schemaGetAllJurnalResponse>;

export type TGetDetailJurnalResponse = TJurnal;

export const schemaCreateJurnalRequest = z.object({
  pesertaMagangId: z.string().min(1, "Peserta magang wajib dipilih"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  kegiatan: z.string().min(1, "Kegiatan wajib diisi"),
});

export type TCreateJurnalRequest = z.infer<typeof schemaCreateJurnalRequest>;
export type TCreateJurnalResponse = TJurnal;

export const schemaUpdateJurnalRequest = schemaCreateJurnalRequest.omit({ pesertaMagangId: true });
export type TUpdateJurnalRequest = z.infer<typeof schemaUpdateJurnalRequest>;
export type TUpdateJurnalResponse = TJurnal;
