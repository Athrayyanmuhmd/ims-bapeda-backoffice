import { z } from "zod";
import type { TPaginationRequest } from "@/types/request";

export const STATUS_MAGANG_OPTIONS = ["AKTIF", "SELESAI", "BERHENTI"] as const;

// Indonesian mobile: 08… / 62… / +62… — blank allowed (optional field).
const phoneIdSchema = z
  .string()
  .optional()
  .refine(
    (value) => {
      if (!value) return true;
      const compact = value.replace(/[\s\-()]/g, "");
      return /^(\+62|62|0)8[1-9][0-9]{7,11}$/.test(compact);
    },
    { message: "Format nomor HP tidak valid (contoh: 081234567890)" }
  );

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
  // Whether the peserta can log into the portal. The API reports this as a
  // boolean; the password hash is never sent.
  hasPortalAccount: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TPesertaMagang = z.infer<typeof schemaPesertaMagang>;

export type TGetAllPesertaMagangRequest = TPaginationRequest;
export const schemaGetAllPesertaMagangResponse = schemaPesertaMagang;
export type TGetAllPesertaMagangResponse = z.infer<typeof schemaGetAllPesertaMagangResponse>;

export type TGetDetailPesertaMagangResponse = TPesertaMagang;

// Blank = leave portal untouched / inactive. Non-blank must meet the backend min.
const portalPasswordField = z.union([
  z.literal(""),
  z.string().min(8, "Password portal minimal 8 karakter"),
]);

const schemaPesertaMagangFields = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  phoneNumber: phoneIdSchema,
  nim: z.string().optional(),
  divisiId: z.string().optional(),
  instansiId: z.string().optional(),
  pembimbingLapanganId: z.string().optional(),
  tanggalMulai: z.string().optional(),
  tanggalSelesai: z.string().optional(),
  status: z.enum(STATUS_MAGANG_OPTIONS).optional(),
  // Optional on create: blank = portal stays inactive.
  portalPassword: portalPasswordField.optional(),
});

const tanggalRangeRefine = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine(
    (value) => {
      const data = value as {
        tanggalMulai?: string;
        tanggalSelesai?: string;
      };
      if (!data.tanggalMulai || !data.tanggalSelesai) return true;
      return data.tanggalSelesai >= data.tanggalMulai;
    },
    { message: "Tanggal selesai harus setelah atau sama dengan tanggal mulai", path: ["tanggalSelesai"] }
  );

export const schemaCreatePesertaMagangRequest = tanggalRangeRefine(schemaPesertaMagangFields);

export type TCreatePesertaMagangRequest = z.infer<typeof schemaPesertaMagangFields>;
export type TCreatePesertaMagangResponse = TPesertaMagang;

// Edit form: same fields + revoke flag (UI-only; maps to portalPassword: null).
export const schemaUpdatePesertaMagangRequest = tanggalRangeRefine(
  schemaPesertaMagangFields.extend({
    revokePortalAccess: z.boolean().optional(),
  })
);

export type TUpdatePesertaMagangForm = z.infer<typeof schemaPesertaMagangFields> & {
  revokePortalAccess?: boolean;
};

// What the API actually accepts on PUT — revoke becomes portalPassword: null.
export type TUpdatePesertaMagangRequest = Omit<
  TUpdatePesertaMagangForm,
  "revokePortalAccess" | "portalPassword"
> & {
  portalPassword?: string | null;
};

export type TUpdatePesertaMagangResponse = TPesertaMagang;
