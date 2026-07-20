import { z } from "zod";
import type { TPaginationRequest } from "@/types/request";

const schemaInstansi = z.object({
  id: z.string(),
  nama: z.string(),
  jenis: z.string(),
  alamat: z.string().nullable(),
  namaPic: z.string().nullable(),
  noHpPic: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TInstansi = z.infer<typeof schemaInstansi>;

export type TGetAllInstansiRequest = TPaginationRequest;
export const schemaGetAllInstansiResponse = schemaInstansi;
export type TGetAllInstansiResponse = z.infer<typeof schemaGetAllInstansiResponse>;

export type TGetDetailInstansiResponse = TInstansi;

export const schemaCreateInstansiRequest = z.object({
  nama: z.string().min(1, "Nama instansi wajib diisi"),
  jenis: z.string().min(1, "Jenis instansi wajib diisi"),
  alamat: z.string().optional(),
  namaPic: z.string().optional(),
  noHpPic: z.string().optional(),
});

export type TCreateInstansiRequest = z.infer<typeof schemaCreateInstansiRequest>;
export type TCreateInstansiResponse = TInstansi;

export const schemaUpdateInstansiRequest = schemaCreateInstansiRequest;
export type TUpdateInstansiRequest = z.infer<typeof schemaUpdateInstansiRequest>;
export type TUpdateInstansiResponse = TInstansi;
