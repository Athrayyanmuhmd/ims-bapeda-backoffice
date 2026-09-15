"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { services } from "@/services";
import {
  schemaPortalUpdateProfileRequest,
  type TPortalPeserta,
  type TPortalUpdateProfileForm,
} from "@/services/portal/types";
import { updatePortalPeserta } from "@/utils/portal-session";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: TPortalPeserta;
}

export default function EditProfileDialog({
  open,
  onOpenChange,
  profile,
}: EditProfileDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<TPortalUpdateProfileForm>({
    resolver: zodResolver(schemaPortalUpdateProfileRequest),
    defaultValues: {
      name: "",
      phoneNumber: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: profile.name ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [open, profile, form]);

  const mutation = useMutation({
    mutationFn: (value: TPortalUpdateProfileForm) =>
      services.portal.updateProfile({
        name: value.name.trim(),
        phoneNumber: value.phoneNumber?.trim() ?? "",
        ...(value.newPassword?.trim()
          ? {
              currentPassword: value.currentPassword,
              newPassword: value.newPassword,
            }
          : {}),
      }),
    onSuccess: async (res) => {
      const updated = res.content;
      if (updated) {
        await updatePortalPeserta(updated);
        await queryClient.invalidateQueries({ queryKey: ["portal", "me"] });
      }
      toast.success(res.message);
      onOpenChange(false);
    },
    onError: (error: { message: string }) => toast.error(error.message),
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
            name="name"
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
            <Input value={profile.email} disabled readOnly />
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
