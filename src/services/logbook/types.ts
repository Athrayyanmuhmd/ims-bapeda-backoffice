import { z } from "zod";
import type { TPaginationRequest } from "@/types/request";

const schemaLogbook = z.object({
  id: z.string(),
  pesertaMagangId: z.string(),
  name: z.string(),
  divisi: z.string().nullable(),
  tanggal: z.string(),
  kegiatan: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TLogbook = z.infer<typeof schemaLogbook>;

export type TGetAllLogbookRequest = TPaginationRequest;
export const schemaGetAllLogbookResponse = schemaLogbook;
export type TGetAllLogbookResponse = z.infer<typeof schemaGetAllLogbookResponse>;

export type TGetDetailLogbookResponse = TLogbook;

export const schemaCreateLogbookRequest = z.object({
  pesertaMagangId: z.string().min(1, "Peserta magang wajib dipilih"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  kegiatan: z.string().min(1, "Kegiatan wajib diisi"),
});

export type TCreateLogbookRequest = z.infer<typeof schemaCreateLogbookRequest>;
export type TCreateLogbookResponse = TLogbook;

export const schemaUpdateLogbookRequest = schemaCreateLogbookRequest.omit({ pesertaMagangId: true });
export type TUpdateLogbookRequest = z.infer<typeof schemaUpdateLogbookRequest>;
export type TUpdateLogbookResponse = TLogbook;
