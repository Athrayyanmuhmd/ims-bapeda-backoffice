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
  phoneNumber: z.string().optional(),
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
  phoneNumber: z.string().optional(),
  divisiId: z.string().optional(),
  roleId: z.string().optional(),
  status: z.string().optional(),
});

export type TUpdateUserRequest = z.infer<typeof schemaUpdateUserRequest>;
export type TUpdateUserResponse = TUser;
