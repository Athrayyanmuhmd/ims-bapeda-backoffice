"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";
import {
  schemaUpdateOwnProfileRequest,
  type TUpdateOwnProfileForm,
} from "@/services/user/types";
import { useAuth } from "@/stores/auth";
import { updateSessionUser } from "@/utils/session";

interface DialogEditProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DialogEditProfile({ open, onOpenChange }: DialogEditProfileProps) {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);

  const { data: detailRes } = useQuery({
    queryKey: queryKeys.user.detail(user?.id ?? ""),
    queryFn: () => services.user.getDetailUser(user!.id),
    enabled: open && !!user?.id,
    meta: { silent: true },
  });

  const detail = detailRes?.content;

  const form = useForm<TUpdateOwnProfileForm>({
    resolver: zodResolver(schemaUpdateOwnProfileRequest),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      fullName: detail?.fullName ?? user?.fullName ?? "",
      phoneNumber: detail?.phoneNumber ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [open, detail, user?.fullName, form]);

  const mutation = useMutation({
    mutationFn: (value: TUpdateOwnProfileForm) => {
      const payload = {
        fullName: value.fullName.trim(),
        phoneNumber: value.phoneNumber?.trim() ?? "",
        ...(value.newPassword?.trim()
          ? {
              currentPassword: value.currentPassword,
              newPassword: value.newPassword,
            }
          : {}),
      };
      return services.user.updateOwnProfile(payload);
    },
    onSuccess: async (res) => {
      const updated = res.content;
      if (updated && user) {
        const nextUser = {
          id: updated.id,
          fullName: updated.fullName,
          email: updated.email,
          status: updated.status,
          role: updated.role,
        };
        setUser(nextUser);
        await updateSessionUser(nextUser);
      }
      toast.success(res.message);
      onOpenChange(false);
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const onSubmit = form.handleSubmit((value) => mutation.mutate(value));

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Profil"
      description="Ubah nama atau nomor HP. Password hanya diisi jika ingin diganti."
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Batal
          </Button>
          <Button onClick={onSubmit} isLoading={mutation.isPending} disabled={mutation.isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        <FieldGroup className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="fullName"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Nama</FieldLabel>
                <Input autoComplete="name" {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input value={user?.email ?? ""} disabled readOnly />
            <p className="text-muted-foreground text-xs">Email tidak dapat diubah sendiri.</p>
          </Field>

          <Controller
            control={form.control}
            name="phoneNumber"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Nomor HP</FieldLabel>
                <Input
                  type="tel"
                  autoComplete="tel"
                  placeholder="081234567890"
                  {...field}
                  value={field.value ?? ""}
                />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <div className="border-t border-[#E8EEF0] pt-3">
            <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
              Ganti password (opsional)
            </p>
            <div className="flex flex-col gap-4">
              <Controller
                control={form.control}
                name="currentPassword"
                render={({ field, fieldState: { error } }) => (
                  <Field>
                    <FieldLabel>Password Saat Ini</FieldLabel>
                    <Input type="password" autoComplete="current-password" {...field} />
                    <FieldError errors={[error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="newPassword"
                render={({ field, fieldState: { error } }) => (
                  <Field>
                    <FieldLabel>Password Baru</FieldLabel>
                    <Input type="password" autoComplete="new-password" {...field} />
                    <FieldError errors={[error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState: { error } }) => (
                  <Field>
                    <FieldLabel>Konfirmasi Password Baru</FieldLabel>
                    <Input type="password" autoComplete="new-password" {...field} />
                    <FieldError errors={[error]} />
                  </Field>
                )}
              />
            </div>
          </div>
        </FieldGroup>
      </form>
    </Modal>
  );
}
