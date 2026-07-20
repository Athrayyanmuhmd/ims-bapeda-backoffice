import { z } from "zod";
import type { TPaginationRequest } from "@/types/request";

export const KEHADIRAN_OPTIONS = ["Hadir", "Sakit", "Izin", "Alpa"] as const;

const schemaAbsensi = z.object({
  id: z.string(),
  name: z.string(),
  pesertaMagangId: z.string(),
  divisi: z.string().nullable(),
  pembimbingLapangan: z.string().nullable(),
  kehadiran: z.string(),
  tanggal: z.string(),
  jamMasuk: z.string().nullable(),
  jamKeluar: z.string().nullable(),
  keterangan: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TAbsensi = z.infer<typeof schemaAbsensi>;

export type TGetAllAbsensiRequest = TPaginationRequest;
export const schemaGetAllAbsensiResponse = schemaAbsensi;
export type TGetAllAbsensiResponse = z.infer<typeof schemaGetAllAbsensiResponse>;

export type TGetDetailAbsensiResponse = TAbsensi;

export const schemaCreateAbsensiRequest = z.object({
  pesertaMagangId: z.string().min(1, "Peserta magang wajib dipilih"),
  kehadiran: z.string().min(1, "Kehadiran wajib dipilih"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  jamMasuk: z.string().optional(),
  jamKeluar: z.string().optional(),
  keterangan: z.string().optional(),
});

export type TCreateAbsensiRequest = z.infer<typeof schemaCreateAbsensiRequest>;
export type TCreateAbsensiResponse = TAbsensi;

export const schemaUpdateAbsensiRequest = schemaCreateAbsensiRequest
  .omit({ pesertaMagangId: true })
  .partial({ tanggal: true });
export type TUpdateAbsensiRequest = z.infer<typeof schemaUpdateAbsensiRequest>;
export type TUpdateAbsensiResponse = TAbsensi;
