"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { SingleSelect } from "@/components/single-select";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";
import {
  schemaCreateJurnalRequest,
  type TCreateJurnalRequest,
  type TJurnal,
} from "@/services/jurnal/types";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jurnal?: TJurnal | null;
}

export function FormDialog({ open, onOpenChange, jurnal }: FormDialogProps) {
  const isEdit = !!jurnal;
  const queryClient = useQueryClient();

  const { data: pesertaData } = useQuery({
    queryKey: queryKeys.pesertaMagang.lookup(),
    queryFn: () => services.pesertaMagang.getAllPesertaMagang({ rows: 100 }),
    enabled: open,
  });

  const pesertaOptions = (pesertaData?.content?.entries ?? []).map((p) => ({
    label: p.name,
    value: p.id,
  }));

  const form = useForm<TCreateJurnalRequest>({
    resolver: zodResolver(schemaCreateJurnalRequest),
    defaultValues: { pesertaMagangId: "", tanggal: "", kegiatan: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        pesertaMagangId: jurnal?.pesertaMagangId ?? "",
        tanggal: jurnal?.tanggal ? DateTime.fromISO(jurnal.tanggal).toISODate() ?? "" : "",
        kegiatan: jurnal?.kegiatan ?? "",
      });
    }
  }, [open, jurnal, form]);

  const mutation = useMutation({
    mutationFn: (data: TCreateJurnalRequest) =>
      isEdit
        ? services.jurnal.updateJurnal(jurnal.id, { tanggal: data.tanggal, kegiatan: data.kegiatan })
        : services.jurnal.createJurnal(data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.jurnal.all });
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
      title={isEdit ? "Edit Jurnal" : "Tambah Jurnal"}
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
            name="pesertaMagangId"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Peserta Magang</FieldLabel>
                <SingleSelect
                  options={pesertaOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Pilih peserta magang"
                  disabled={isEdit}
                />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="tanggal"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Tanggal</FieldLabel>
                <Input type="date" {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="kegiatan"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Kegiatan</FieldLabel>
                <Textarea placeholder="Apa yang dikerjakan hari ini..." rows={4} {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </Modal>
  );
}
