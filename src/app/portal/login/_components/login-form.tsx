"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { services } from "@/services";
import {
  schemaPortalLoginRequest,
  type TPortalLoginRequest,
  type TPortalLoginResponse,
} from "@/services/portal/types";
import { setPortalSession } from "@/utils/portal-session";

export default function LoginForm() {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const form = useForm<TPortalLoginRequest>({
    resolver: zodResolver(schemaPortalLoginRequest),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (value: TPortalLoginRequest) => services.portal.login(value),
    onSuccess: async (res) => {
      const content = res.content as TPortalLoginResponse;
      await setPortalSession({ token: content.token, peserta: content.peserta });

      toast.success(res.message);
      // Full navigation so the server layout re-reads the fresh session cookie.
      window.location.href = "/portal";
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const onSubmit = form.handleSubmit((value) => mutation.mutate(value));

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit}>
          <FieldGroup className="flex flex-col gap-4">
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState: { error } }) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input placeholder="email@student.ac.id" autoComplete="username" {...field} />
                  <FieldError errors={[error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState: { error } }) => (
                <Field>
                  <FieldLabel>Password</FieldLabel>
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

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
              isLoading={mutation.isPending}
            >
              Masuk
            </Button>

            <p className="text-muted-foreground text-center text-xs">
              Belum punya akses? Hubungi pembimbing lapangan Anda untuk mengaktifkan akun portal.
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
