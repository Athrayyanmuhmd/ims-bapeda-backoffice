import { z } from "zod";

export const schemaPortalLoginRequest = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type TPortalLoginRequest = z.infer<typeof schemaPortalLoginRequest>;

export type TPortalPeserta = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  nim: string | null;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  status: string;
  divisi: string | null;
  instansi: string | null;
  pembimbingLapangan: string | null;
  // Remaining days until tanggalSelesai. Working days exclude weekends +
  // Indonesian national/cuti bersama holidays.
  sisaHariKalender?: number | null;
  sisaHariKerja?: number | null;
  // Full period length (mulai → selesai) for progress bars.
  totalHariKalender?: number | null;
  totalHariKerja?: number | null;
};

export type TPortalLoginResponse = {
  peserta: TPortalPeserta;
  token: string;
};

export type TPortalAbsensi = {
  id: string;
  kehadiran: string;
  tanggal: string;
  jamMasuk: string | null;
  jamKeluar: string | null;
  keterangan: string | null;
  izinStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
  izinJenis?: string | null;
};

export type TPortalLogbook = {
  id: string;
  tanggal: string;
  kegiatan: string;
  createdAt: string;
};

export type TPortalPenilaian = {
  id: string;
  nilai: number;
  komentar: string | null;
  penilai: string;
  createdAt: string;
};

export type TPortalDokumen = {
  id: string;
  jenisDokumen: string;
  namaFile: string;
  urlFile: string;
  createdAt: string;
};

export type TPortalCheckInWindow = {
  start: string;
  end: string;
  label: string;
  isOpen: boolean;
  now: string;
  autoCheckoutAt?: string;
};

export const PORTAL_IZIN_OPTIONS = ["Izin", "Sakit"] as const;

export const schemaPortalIzinRequest = z.object({
  jenis: z.enum(PORTAL_IZIN_OPTIONS, { message: "Pilih Izin atau Sakit" }),
  keterangan: z.string().max(500, "Keterangan maksimal 500 karakter").optional(),
});

export type TPortalIzinRequest = z.infer<typeof schemaPortalIzinRequest>;

export const schemaPortalLogbookRequest = z.object({
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  kegiatan: z.string().min(1, "Kegiatan wajib diisi"),
});

export type TPortalLogbookRequest = z.infer<typeof schemaPortalLogbookRequest>;

export const schemaPortalChangePasswordRequest = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Password baru harus berbeda dari password saat ini",
    path: ["newPassword"],
  });

export type TPortalChangePasswordForm = z.infer<typeof schemaPortalChangePasswordRequest>;

const phoneOptional = z
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

export const schemaPortalUpdateProfileRequest = z
  .object({
    name: z.string().min(1, "Nama wajib diisi"),
    phoneNumber: phoneOptional,
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const changing =
      !!data.newPassword?.trim() ||
      !!data.confirmPassword?.trim() ||
      !!data.currentPassword?.trim();
    if (!changing) return;

    if (!data.currentPassword?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password saat ini wajib diisi",
        path: ["currentPassword"],
      });
    }
    if (!data.newPassword || data.newPassword.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password baru minimal 8 karakter",
        path: ["newPassword"],
      });
    }
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Konfirmasi password tidak sama",
        path: ["confirmPassword"],
      });
    }
    if (data.newPassword && data.currentPassword && data.newPassword === data.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password baru harus berbeda dari password saat ini",
        path: ["newPassword"],
      });
    }
  });

export type TPortalUpdateProfileForm = z.infer<typeof schemaPortalUpdateProfileRequest>;

export type TPortalUpdateProfileRequest = {
  name: string;
  phoneNumber?: string;
  currentPassword?: string;
  newPassword?: string;
};
