import { z } from "zod";
import type { TPaginationRequest } from "@/types/request";

export const STATUS_MAGANG_OPTIONS = ["AKTIF", "SELESAI", "BERHENTI"] as const;

const schemaPesertaMagang = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string().nullable(),
  nim: z.string().nullable(),
  divisi: z.string().nullable(),
  divisiId: z.string().nullable(),
  instansi: z.string().nullable(),
  instansiId: z.string().nullable(),
  pembimbingLapangan: z.string().nullable(),
  pembimbingLapanganId: z.string().nullable(),
  tanggalMulai: z.string().nullable(),
  tanggalSelesai: z.string().nullable(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TPesertaMagang = z.infer<typeof schemaPesertaMagang>;

export type TGetAllPesertaMagangRequest = TPaginationRequest;
export const schemaGetAllPesertaMagangResponse = schemaPesertaMagang;
export type TGetAllPesertaMagangResponse = z.infer<typeof schemaGetAllPesertaMagangResponse>;

export type TGetDetailPesertaMagangResponse = TPesertaMagang;

export const schemaCreatePesertaMagangRequest = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  phoneNumber: z.string().optional(),
  nim: z.string().optional(),
  divisiId: z.string().optional(),
  instansiId: z.string().optional(),
  pembimbingLapanganId: z.string().optional(),
  tanggalMulai: z.string().optional(),
  tanggalSelesai: z.string().optional(),
  status: z.string().optional(),
});

export type TCreatePesertaMagangRequest = z.infer<typeof schemaCreatePesertaMagangRequest>;
export type TCreatePesertaMagangResponse = TPesertaMagang;

export const schemaUpdatePesertaMagangRequest = schemaCreatePesertaMagangRequest;
export type TUpdatePesertaMagangRequest = z.infer<typeof schemaUpdatePesertaMagangRequest>;
export type TUpdatePesertaMagangResponse = TPesertaMagang;
