"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TResponse } from "@/types/response";

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  description: z.string().optional(),
});

type TFormValues = z.infer<typeof schema>;

interface NameDescriptionEntity {
  id: string;
  name: string;
  description: string | null;
}

interface SimpleFormDialogProps<T extends NameDescriptionEntity> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity?: T | null;
  label: string;
  queryKey: QueryKey;
  create: (data: TFormValues) => Promise<TResponse<T>>;
  update: (id: string, data: TFormValues) => Promise<TResponse<T>>;
}

// Shared by every "just a name + description" resource (Divisi, Role, ...).
export function SimpleFormDialog<T extends NameDescriptionEntity>({
  open,
  onOpenChange,
  entity,
  label,
  queryKey,
  create,
  update,
}: SimpleFormDialogProps<T>) {
  const isEdit = !!entity;
  const queryClient = useQueryClient();

  const form = useForm<TFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: entity?.name ?? "", description: entity?.description ?? "" });
    }
  }, [open, entity, form]);

  const mutation = useMutation({
    mutationFn: (data: TFormValues) => (isEdit ? update(entity.id, data) : create(data)),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey });
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
      title={isEdit ? `Edit ${label}` : `Tambah ${label}`}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
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
                <FieldLabel>Nama {label}</FieldLabel>
                <Input placeholder={`Masukkan nama ${label.toLowerCase()}`} {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Deskripsi</FieldLabel>
                <Textarea placeholder="Masukkan deskripsi" {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </Modal>
  );
}
