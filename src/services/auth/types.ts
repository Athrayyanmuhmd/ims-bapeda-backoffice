import { z } from "zod";

// login
export const schemaLoginRequest = z.object({
  email: z.string(),
  password: z.string(),
});

export type TLoginRequest = z.infer<typeof schemaLoginRequest>;

export const schemaLoginResponse = z.object({
  user: z.object({
    id: z.string(),
    fullName: z.string(),
    email: z.string(),
    status: z.string(),
    role: z.string().nullable(),
  }),
  token: z.string(),
});

export type TLoginResponse = z.infer<typeof schemaLoginResponse>;
