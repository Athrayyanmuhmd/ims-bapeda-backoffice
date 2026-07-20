"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Modal } from "@/components/modal";
import { SingleSelect } from "@/components/single-select";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";
import { KEHADIRAN_OPTIONS, type TAbsensi } from "@/services/absensi/types";

const schemaForm = z.object({
  pesertaMagangId: z.string().min(1, "Peserta magang wajib dipilih"),
  kehadiran: z.string().min(1, "Kehadiran wajib dipilih"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  jamMasuk: z.string().optional(),
  jamKeluar: z.string().optional(),
  keterangan: z.string().optional(),
});

type TFormValues = z.infer<typeof schemaForm>;

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  absensi?: TAbsensi | null;
}

export function FormDialog({ open, onOpenChange, absensi }: FormDialogProps) {
  const isEdit = !!absensi;
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

  const form = useForm<TFormValues>({
    resolver: zodResolver(schemaForm),
    defaultValues: {
      pesertaMagangId: "",
      kehadiran: "",
      tanggal: "",
      jamMasuk: "",
      jamKeluar: "",
      keterangan: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        pesertaMagangId: absensi?.pesertaMagangId ?? "",
        kehadiran: absensi?.kehadiran ?? "",
        tanggal: absensi?.tanggal ? DateTime.fromISO(absensi.tanggal).toISODate() ?? "" : "",
        jamMasuk: absensi?.jamMasuk ? DateTime.fromISO(absensi.jamMasuk).toFormat("HH:mm") : "",
        jamKeluar: absensi?.jamKeluar ? DateTime.fromISO(absensi.jamKeluar).toFormat("HH:mm") : "",
        keterangan: absensi?.keterangan ?? "",
      });
    }
  }, [open, absensi, form]);

  const mutation = useMutation({
    mutationFn: (value: TFormValues) => {
      const payload = {
        pesertaMagangId: value.pesertaMagangId,
        kehadiran: value.kehadiran,
        tanggal: value.tanggal,
        jamMasuk: value.jamMasuk ? `${value.tanggal}T${value.jamMasuk}:00` : undefined,
        jamKeluar: value.jamKeluar ? `${value.tanggal}T${value.jamKeluar}:00` : undefined,
        keterangan: value.keterangan,
      };

      return isEdit
        ? services.absensi.updateAbsensi(absensi.id, payload)
        : services.absensi.createAbsensi(payload);
    },
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.absensi.all });
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
      title={isEdit ? "Edit Absensi" : "Tambah Absensi"}
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
            name="kehadiran"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Kehadiran</FieldLabel>
                <SingleSelect
                  options={KEHADIRAN_OPTIONS.map((k) => ({ label: k, value: k }))}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Pilih kehadiran"
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

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="jamMasuk"
              render={({ field, fieldState: { error } }) => (
                <Field>
                  <FieldLabel>Jam Masuk</FieldLabel>
                  <Input type="time" {...field} />
                  <FieldError errors={[error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="jamKeluar"
              render={({ field, fieldState: { error } }) => (
                <Field>
                  <FieldLabel>Jam Keluar</FieldLabel>
                  <Input type="time" {...field} />
                  <FieldError errors={[error]} />
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="keterangan"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Keterangan</FieldLabel>
                <Textarea placeholder="Opsional" {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </Modal>
  );
}
