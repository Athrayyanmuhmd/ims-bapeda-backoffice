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
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";
import {
  schemaCreateInstansiRequest,
  type TCreateInstansiRequest,
  type TInstansi,
} from "@/services/instansi/types";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instansi?: TInstansi | null;
}

export function FormDialog({ open, onOpenChange, instansi }: FormDialogProps) {
  const isEdit = !!instansi;
  const queryClient = useQueryClient();

  const form = useForm<TCreateInstansiRequest>({
    resolver: zodResolver(schemaCreateInstansiRequest),
    defaultValues: { nama: "", jenis: "", alamat: "", namaPic: "", noHpPic: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nama: instansi?.nama ?? "",
        jenis: instansi?.jenis ?? "",
        alamat: instansi?.alamat ?? "",
        namaPic: instansi?.namaPic ?? "",
        noHpPic: instansi?.noHpPic ?? "",
      });
    }
  }, [open, instansi, form]);

  const mutation = useMutation({
    mutationFn: (data: TCreateInstansiRequest) =>
      isEdit
        ? services.instansi.updateInstansi(instansi.id, data)
        : services.instansi.createInstansi(data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.instansi.all });
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
      title={isEdit ? "Edit Instansi" : "Tambah Instansi"}
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
            name="nama"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Nama Instansi</FieldLabel>
                <Input placeholder="Masukkan nama sekolah/kampus" {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="jenis"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Jenis</FieldLabel>
                <Input placeholder="SMA / SMK / Universitas / ..." {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="alamat"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Alamat</FieldLabel>
                <Input placeholder="Masukkan alamat" {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="namaPic"
              render={({ field, fieldState: { error } }) => (
                <Field>
                  <FieldLabel>Nama PIC</FieldLabel>
                  <Input placeholder="Nama penanggung jawab" {...field} />
                  <FieldError errors={[error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="noHpPic"
              render={({ field, fieldState: { error } }) => (
                <Field>
                  <FieldLabel>No. HP PIC</FieldLabel>
                  <Input placeholder="Masukkan no. HP" {...field} />
                  <FieldError errors={[error]} />
                </Field>
              )}
            />
          </div>
        </FieldGroup>
      </form>
    </Modal>
  );
}
