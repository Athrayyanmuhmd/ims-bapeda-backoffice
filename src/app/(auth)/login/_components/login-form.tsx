"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { services } from "@/services";
import { schemaLoginRequest, type TLoginRequest, type TLoginResponse } from "@/services/auth/types";
import type { TPortalLoginResponse } from "@/services/portal/types";
import { setPortalSession } from "@/utils/portal-session";
import { setSession } from "@/utils/session";

type LoginError = { message?: string; status?: number };

export default function LoginForm() {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const form = useForm<TLoginRequest>({
    resolver: zodResolver(schemaLoginRequest),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (value: TLoginRequest) => {
      try {
        const staff = await services.auth.login().mutationFn(value);
        return { kind: "staff" as const, res: staff };
      } catch (staffErr) {
        const err = staffErr as LoginError;
        // Wrong staff credentials → try portal. Other failures (inactive, etc.) stop here.
        if (err.status !== 401) throw staffErr;
      }

      try {
        const portal = await services.portal.login(value);
        return { kind: "peserta" as const, res: portal };
      } catch (portalErr) {
        const err = portalErr as LoginError;
        throw {
          message: err.message || "Email atau password salah",
          status: err.status,
        } satisfies LoginError;
      }
    },
  });

  const onSubmit = form.handleSubmit((value) => {
    mutation.mutate(value, {
      onSuccess: async (result) => {
        try {
          if (result.kind === "staff") {
            // Must await: setSession is a server action. Redirecting before the
            // cookie lands makes /dashboard bounce back to /login (toast still
            // said success) — especially visible in a fresh/other browser.
            await setSession(result.res.content as TLoginResponse);
            toast.success(result.res.message);
            window.location.assign("/dashboard");
            return;
          }

          const content = result.res.content as TPortalLoginResponse;
          await setPortalSession({ token: content.token, peserta: content.peserta });
          toast.success(result.res.message);
          window.location.assign("/portal");
        } catch {
          toast.error("Login berhasil, tetapi sesi gagal disimpan. Coba lagi.");
        }
      },
      onError: (error: LoginError) => toast.error(error.message || "Email atau password salah"),
    });
  });

  return (
    <div className="col-span-1 h-full">
      <div className="bg-background flex h-full w-full flex-col items-center justify-center rounded-2xl p-6 sm:p-8">
        <div className="w-full">
          <div className="mb-6 flex flex-col">
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={320}
                height={180}
                className="h-14 w-auto object-contain"
              />
            </div>

            <h4 className="font-display text-foreground text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              Selamat Datang
            </h4>
            <p className="text-muted-foreground text-center text-sm">
              Masuk dengan email dan kata sandi akun Anda
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <FieldGroup className="flex flex-col gap-4">
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState: { error } }) => (
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input placeholder="Masukkan email Anda" autoComplete="username" {...field} />
                    <FieldError errors={[error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState: { error } }) => (
                  <Field>
                    <FieldLabel>Kata Sandi</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        type={isShowPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Masukkan kata sandi Anda"
                        {...field}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          variant="ghost"
                          type="button"
                          onClick={() => setIsShowPassword(!isShowPassword)}
                        >
                          <Icon icon={isShowPassword ? "mdi:eye-off" : "mdi:eye"} />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldError errors={[error]} />
                  </Field>
                )}
              />
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                  isLoading={mutation.isPending}
                >
                  Masuk
                </Button>
              </div>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  );
}
