"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  schemaPortalLoginRequest,
  type TPortalLoginRequest,
  type TPortalLoginResponse,
} from "@/services/portal/types";
import { cn } from "@/utils/classname";
import { setPortalSession } from "@/utils/portal-session";
import { setSession } from "@/utils/session";

type LoginAs = "staff" | "peserta";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAs: LoginAs = searchParams.get("as") === "peserta" ? "peserta" : "staff";
  const [loginAs, setLoginAs] = useState<LoginAs>(initialAs);
  const [isShowPassword, setIsShowPassword] = useState(false);

  const staffForm = useForm<TLoginRequest>({
    resolver: zodResolver(schemaLoginRequest),
    defaultValues: { email: "", password: "" },
  });

  const portalForm = useForm<TPortalLoginRequest>({
    resolver: zodResolver(schemaPortalLoginRequest),
    defaultValues: { email: "", password: "" },
  });

  const staffMutation = useMutation(services.auth.login());
  const portalMutation = useMutation({
    mutationFn: (value: TPortalLoginRequest) => services.portal.login(value),
  });

  const switchAs = (next: LoginAs) => {
    setLoginAs(next);
    setIsShowPassword(false);
    router.replace(next === "peserta" ? "/login?as=peserta" : "/login", { scroll: false });
  };

  const onStaffSubmit = staffForm.handleSubmit((value) => {
    staffMutation.mutate(value, {
      onSuccess: (res) => {
        setSession(res.content as TLoginResponse);
        toast.success(res.message);
        window.location.href = "/dashboard";
      },
      onError: (error: { message: string }) => toast.error(error.message),
    });
  });

  const onPortalSubmit = portalForm.handleSubmit((value) => {
    portalMutation.mutate(value, {
      onSuccess: async (res) => {
        const content = res.content as TPortalLoginResponse;
        await setPortalSession({ token: content.token, peserta: content.peserta });
        toast.success(res.message);
        window.location.href = "/portal";
      },
      onError: (error: { message: string }) => toast.error(error.message),
    });
  });

  const isPeserta = loginAs === "peserta";
  const isPending = isPeserta ? portalMutation.isPending : staffMutation.isPending;

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
              Satu halaman masuk — pilih peran Anda
            </p>
          </div>

          <div
            className="bg-muted mb-6 grid grid-cols-2 gap-1 rounded-xl p-1"
            role="tablist"
            aria-label="Jenis akun"
          >
            <button
              type="button"
              role="tab"
              aria-selected={!isPeserta}
              onClick={() => switchAs("staff")}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                !isPeserta
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Staff
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isPeserta}
              onClick={() => switchAs("peserta")}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isPeserta
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Peserta Magang
            </button>
          </div>

          {isPeserta ? (
            <form onSubmit={onPortalSubmit} className="space-y-4">
              <FieldGroup className="flex flex-col gap-4">
                <Controller
                  control={portalForm.control}
                  name="email"
                  render={({ field, fieldState: { error } }) => (
                    <Field>
                      <FieldLabel>Email</FieldLabel>
                      <Input
                        placeholder="email@student.ac.id"
                        autoComplete="username"
                        {...field}
                      />
                      <FieldError errors={[error]} />
                    </Field>
                  )}
                />
                <Controller
                  control={portalForm.control}
                  name="password"
                  render={({ field, fieldState: { error } }) => (
                    <Field>
                      <FieldLabel>Kata Sandi</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          type={isShowPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Password portal Anda"
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
                    disabled={isPending}
                    isLoading={isPending}
                  >
                    Masuk Portal
                  </Button>
                </div>
                <p className="text-muted-foreground text-center text-xs">
                  Belum punya akses? Hubungi Admin/pembimbing untuk mengaktifkan akun portal.
                </p>
              </FieldGroup>
            </form>
          ) : (
            <form onSubmit={onStaffSubmit} className="space-y-4">
              <FieldGroup className="flex flex-col gap-4">
                <Controller
                  control={staffForm.control}
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
                  control={staffForm.control}
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
                    disabled={isPending}
                    isLoading={isPending}
                  >
                    Masuk
                  </Button>
                </div>
              </FieldGroup>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
