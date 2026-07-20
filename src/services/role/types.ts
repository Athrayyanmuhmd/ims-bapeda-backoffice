import { z } from "zod";
import type { TPaginationRequest } from "@/types/request";

const schemaRole = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TRole = z.infer<typeof schemaRole>;

export type TGetAllRoleRequest = TPaginationRequest;
export const schemaGetAllRoleResponse = schemaRole;
export type TGetAllRoleResponse = z.infer<typeof schemaGetAllRoleResponse>;

export type TGetDetailRoleResponse = TRole;

export const schemaCreateRoleRequest = z.object({
  name: z.string().min(1, "Nama role wajib diisi"),
  description: z.string().optional(),
});

export type TCreateRoleRequest = z.infer<typeof schemaCreateRoleRequest>;
export type TCreateRoleResponse = TRole;

export const schemaUpdateRoleRequest = schemaCreateRoleRequest;
export type TUpdateRoleRequest = z.infer<typeof schemaUpdateRoleRequest>;
export type TUpdateRoleResponse = TRole;
