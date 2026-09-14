"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { SingleSelect } from "@/components/single-select";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { services } from "@/services";
import {
  PORTAL_IZIN_OPTIONS,
  schemaPortalIzinRequest,
  type TPortalIzinRequest,
} from "@/services/portal/types";

const OPTIONS = PORTAL_IZIN_OPTIONS.map((v) => ({ label: v, value: v }));

interface IzinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export default function IzinDialog({ open, onOpenChange, onSaved }: IzinDialogProps) {
  const form = useForm<TPortalIzinRequest>({
    resolver: zodResolver(schemaPortalIzinRequest),
    defaultValues: { jenis: "Izin", keterangan: "" },
  });

  useEffect(() => {
    if (open) form.reset({ jenis: "Izin", keterangan: "" });
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: (value: TPortalIzinRequest) => services.portal.reportIzin(value),
    onSuccess: (res) => {
      toast.success(res.message);
      onOpenChange(false);
      onSaved();
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const onSubmit = form.handleSubmit((value) => mutation.mutate(value));

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Ajukan Izin / Sakit"
      description="Hanya untuk hari ini. Pembimbing lapangan dapat mengoreksi catatan jika diperlukan."
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
            Ajukan
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        <FieldGroup className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="jenis"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Jenis</FieldLabel>
                <SingleSelect
                  options={OPTIONS}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "Izin")}
                  placeholder="Pilih jenis"
                />
                <FieldError errors={[error]} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="keterangan"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Keterangan (opsional)</FieldLabel>
                <Textarea
                  rows={3}
                  placeholder="Alasan singkat, mis. sakit demam / keperluan keluarga"
                  {...field}
                />
                <FieldError errors={[error]} />
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </Modal>
  );
}
