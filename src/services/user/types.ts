import { z } from "zod";
import type { TPaginationRequest } from "@/types/request";

const schemaUser = z.object({
  id: z.string(),
  fullName: z.string(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string().nullable(),
  status: z.string(),
  divisi: z.string().nullable(),
  divisiId: z.string().nullable(),
  role: z.string().nullable(),
  roleId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TUser = z.infer<typeof schemaUser>;

// get all
export type TGetAllUserRequest = TPaginationRequest;
export const schemaGetAllUserResponse = schemaUser;
export type TGetAllUserResponse = z.infer<typeof schemaGetAllUserResponse>;

// get detail
export type TGetDetailUserResponse = TUser;

// create
export const schemaCreateUserRequest = z.object({
  fullName: z.string().min(1, "Nama wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        const compact = value.replace(/[\s\-()]/g, "");
        return /^(\+62|62|0)8[1-9][0-9]{7,11}$/.test(compact);
      },
      { message: "Format nomor HP tidak valid (contoh: 081234567890)" }
    ),
  divisiId: z.string().optional(),
  roleId: z.string().optional(),
});

export type TCreateUserRequest = z.infer<typeof schemaCreateUserRequest>;
export type TCreateUserResponse = TUser;

// update
export const schemaUpdateUserRequest = z.object({
  fullName: z.string().min(1, "Nama wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter").optional().or(z.literal("")),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        const compact = value.replace(/[\s\-()]/g, "");
        return /^(\+62|62|0)8[1-9][0-9]{7,11}$/.test(compact);
      },
      { message: "Format nomor HP tidak valid (contoh: 081234567890)" }
    ),
  divisiId: z.string().optional(),
  roleId: z.string().optional(),
  status: z.string().optional(),
});

export type TUpdateUserRequest = z.infer<typeof schemaUpdateUserRequest>;
export type TUpdateUserResponse = TUser;

// change own password — mirrors the backend's rules (min 8, must differ) so the
// user sees them before a round trip, not instead of the server checking.
export const schemaChangePasswordRequest = z
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

export type TChangePasswordForm = z.infer<typeof schemaChangePasswordRequest>;

// confirmPassword is a UI-only field; it never goes to the API.
export type TChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

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

export const schemaUpdateOwnProfileRequest = z
  .object({
    fullName: z.string().min(1, "Nama wajib diisi"),
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

export type TUpdateOwnProfileForm = z.infer<typeof schemaUpdateOwnProfileRequest>;

export type TUpdateOwnProfileRequest = {
  fullName: string;
  phoneNumber?: string;
  currentPassword?: string;
  newPassword?: string;
};

export type TUpdateOwnProfileResponse = TUser;
