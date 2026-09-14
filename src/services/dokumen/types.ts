import { z } from "zod";
import type { TPaginationRequest } from "@/types/request";

export const JENIS_DOKUMEN_OPTIONS = [
  "SURAT_PENGANTAR",
  "SURAT_BALASAN",
  "SERTIFIKAT",
  "LAPORAN",
  "LAINNYA",
] as const;

const schemaDokumen = z.object({
  id: z.string(),
  pesertaMagangId: z.string(),
  name: z.string(),
  jenisDokumen: z.string(),
  namaFile: z.string(),
  urlFile: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TDokumen = z.infer<typeof schemaDokumen>;

export type TGetAllDokumenRequest = TPaginationRequest;
export const schemaGetAllDokumenResponse = schemaDokumen;
export type TGetAllDokumenResponse = z.infer<typeof schemaGetAllDokumenResponse>;

export type TGetDetailDokumenResponse = TDokumen;

// Either an external link (Google Drive etc.) or the relative path returned by
// /api/dokumen/upload — the latter is deliberately not absolute so stored rows
// survive a domain change, which rules out a plain .url() check.
const urlFileSchema = z
  .string()
  .min(1, "File wajib diunggah atau link wajib diisi")
  .refine(
    (value) => value.startsWith("/") || /^https?:\/\/\S+$/.test(value),
    "Harus berupa URL http(s) yang valid"
  );

export const schemaCreateDokumenRequest = z.object({
  pesertaMagangId: z.string().min(1, "Peserta magang wajib dipilih"),
  jenisDokumen: z.string().min(1, "Jenis dokumen wajib dipilih"),
  namaFile: z.string().min(1, "Nama file wajib diisi"),
  urlFile: urlFileSchema,
});

export type TCreateDokumenRequest = z.infer<typeof schemaCreateDokumenRequest>;
export type TCreateDokumenResponse = TDokumen;

export type TUploadDokumenResponse = {
  urlFile: string;
  namaFile: string;
};
