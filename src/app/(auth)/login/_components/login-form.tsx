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
import { setSession } from "@/utils/session";

export default function LoginForm() {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const form = useForm<TLoginRequest>({
    resolver: zodResolver(schemaLoginRequest),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginFn = useMutation(services.auth.login());

  const onSubmit = form.handleSubmit((value) => {
    loginFn.mutate(value, {
      onSuccess: (res) => {
        setSession(res.content as TLoginResponse);

        toast.success(res.message);

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  });

  return (
    <div className="col-span-1 h-full">
      <div className="bg-background flex h-full w-full flex-col items-center justify-center rounded-2xl p-6 sm:p-8">
        <div className="w-full">
          <div className="mb-8 flex flex-col">
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
              Masuk dengan email dan kata sandi Anda
            </p>
          </div>

          <div className="w-full">
            <form onSubmit={onSubmit} className="space-y-4">
              <FieldGroup className="flex flex-col gap-4">
                {/* Email */}
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState: { error } }) => (
                    <Field>
                      <FieldLabel>Email</FieldLabel>
                      <Input placeholder="Masukkan email Anda" {...field} />
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
                          placeholder="Masukkan kata sandi Anda"
                          {...field}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            variant="ghost"
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

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="default"
                    className="w-full"
                    disabled={loginFn.isPending}
                    isLoading={loginFn.isPending}
                  >
                    Masuk
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
