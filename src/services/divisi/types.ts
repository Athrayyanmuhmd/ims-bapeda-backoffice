import { z } from "zod";
import type { TPaginationRequest } from "@/types/request";

const schemaDivisi = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TDivisi = z.infer<typeof schemaDivisi>;

export type TGetAllDivisiRequest = TPaginationRequest;
export const schemaGetAllDivisiResponse = schemaDivisi;
export type TGetAllDivisiResponse = z.infer<typeof schemaGetAllDivisiResponse>;

export type TGetDetailDivisiResponse = TDivisi;

export const schemaCreateDivisiRequest = z.object({
  name: z.string().min(1, "Nama divisi wajib diisi"),
  description: z.string().optional(),
});

export type TCreateDivisiRequest = z.infer<typeof schemaCreateDivisiRequest>;
export type TCreateDivisiResponse = TDivisi;

export const schemaUpdateDivisiRequest = schemaCreateDivisiRequest;
export type TUpdateDivisiRequest = z.infer<typeof schemaUpdateDivisiRequest>;
export type TUpdateDivisiResponse = TDivisi;
