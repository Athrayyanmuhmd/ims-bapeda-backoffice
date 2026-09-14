"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { services } from "@/services";
import { schemaChangePasswordRequest, type TChangePasswordForm } from "@/services/user/types";

const EMPTY_FORM = { currentPassword: "", newPassword: "", confirmPassword: "" };

interface DialogChangePasswordProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DialogChangePassword({ open, onOpenChange }: DialogChangePasswordProps) {
  const form = useForm<TChangePasswordForm>({
    resolver: zodResolver(schemaChangePasswordRequest),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (open) form.reset(EMPTY_FORM);
  }, [open, form]);

  const mutation = useMutation({
    // confirmPassword stays client-side.
    mutationFn: ({ currentPassword, newPassword }: TChangePasswordForm) =>
      services.user.changeOwnPassword({ currentPassword, newPassword }),
    onSuccess: (res) => {
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
      title="Ganti Password"
      description="Masukkan password saat ini untuk mengonfirmasi, lalu password baru minimal 8 karakter."
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
        </FieldGroup>
      </form>
    </Modal>
  );
}
