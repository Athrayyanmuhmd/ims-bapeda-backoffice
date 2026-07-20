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
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";
import {
  schemaCreatePesertaMagangRequest,
  STATUS_MAGANG_OPTIONS,
  type TCreatePesertaMagangRequest,
  type TPesertaMagang,
} from "@/services/peserta-magang/types";

const STATUS_LABEL: Record<(typeof STATUS_MAGANG_OPTIONS)[number], string> = {
  AKTIF: "Aktif",
  SELESAI: "Selesai",
  BERHENTI: "Berhenti",
};

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peserta?: TPesertaMagang | null;
}

export function FormDialog({ open, onOpenChange, peserta }: FormDialogProps) {
  const isEdit = !!peserta;
  const queryClient = useQueryClient();

  const { data: divisiData } = useQuery({
    queryKey: queryKeys.divisi.options(),
    queryFn: () => services.divisi.getAllDivisi({ rows: 100 }),
    enabled: open,
  });

  const { data: instansiData } = useQuery({
    queryKey: queryKeys.instansi.options(),
    queryFn: () => services.instansi.getAllInstansi({ rows: 100 }),
    enabled: open,
  });

  const { data: userData } = useQuery({
    queryKey: queryKeys.user.options(),
    queryFn: () => services.user.getAllUser({ rows: 100 }),
    enabled: open,
  });

  const divisiOptions = (divisiData?.content?.entries ?? []).map((d) => ({
    label: d.name,
    value: d.id,
  }));
  const instansiOptions = (instansiData?.content?.entries ?? []).map((i) => ({
    label: i.nama,
    value: i.id,
  }));
  const pembimbingOptions = (userData?.content?.entries ?? []).map((u) => ({
    label: u.fullName,
    value: u.id,
  }));
  const statusOptions = STATUS_MAGANG_OPTIONS.map((v) => ({ label: STATUS_LABEL[v], value: v }));

  const form = useForm<TCreatePesertaMagangRequest>({
    resolver: zodResolver(schemaCreatePesertaMagangRequest),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      nim: "",
      divisiId: "",
      instansiId: "",
      pembimbingLapanganId: "",
      tanggalMulai: "",
      tanggalSelesai: "",
      status: "AKTIF",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: peserta?.name ?? "",
        email: peserta?.email ?? "",
        phoneNumber: peserta?.phoneNumber ?? "",
        nim: peserta?.nim ?? "",
        divisiId: peserta?.divisiId ?? "",
        instansiId: peserta?.instansiId ?? "",
        pembimbingLapanganId: peserta?.pembimbingLapanganId ?? "",
        tanggalMulai: peserta?.tanggalMulai ? DateTime.fromISO(peserta.tanggalMulai).toISODate() ?? "" : "",
        tanggalSelesai: peserta?.tanggalSelesai
          ? DateTime.fromISO(peserta.tanggalSelesai).toISODate() ?? ""
          : "",
        status: peserta?.status ?? "AKTIF",
      });
    }
  }, [open, peserta, form]);

  const mutation = useMutation({
    mutationFn: (data: TCreatePesertaMagangRequest) =>
      isEdit
        ? services.pesertaMagang.updatePesertaMagang(peserta.id, data)
        : services.pesertaMagang.createPesertaMagang(data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.pesertaMagang.all });
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
      title={isEdit ? "Edit Peserta Magang" : "Tambah Peserta Magang"}
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
                <FieldLabel>Nama</FieldLabel>
                <Input placeholder="Masukkan nama peserta" {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input placeholder="Masukkan email" {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="phoneNumber"
              render={({ field, fieldState: { error } }) => (
                <Field>
                  <FieldLabel>No. HP</FieldLabel>
                  <Input placeholder="Masukkan no. HP" {...field} />
                  <FieldError errors={[error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="nim"
              render={({ field, fieldState: { error } }) => (
                <Field>
                  <FieldLabel>NIM/NIS</FieldLabel>
                  <Input placeholder="Nomor induk" {...field} />
                  <FieldError errors={[error]} />
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="divisiId"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Divisi</FieldLabel>
                <SingleSelect
                  options={divisiOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Pilih divisi"
                />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="instansiId"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Instansi Asal</FieldLabel>
                <SingleSelect
                  options={instansiOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Pilih sekolah/kampus asal"
                />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="pembimbingLapanganId"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Pembimbing Lapangan</FieldLabel>
                <SingleSelect
                  options={pembimbingOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Pilih pembimbing lapangan"
                />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="tanggalMulai"
              render={({ field, fieldState: { error } }) => (
                <Field>
                  <FieldLabel>Tanggal Mulai</FieldLabel>
                  <Input type="date" {...field} />
                  <FieldError errors={[error]} />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="tanggalSelesai"
              render={({ field, fieldState: { error } }) => (
                <Field>
                  <FieldLabel>Tanggal Selesai</FieldLabel>
                  <Input type="date" {...field} />
                  <FieldError errors={[error]} />
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Status</FieldLabel>
                <SingleSelect
                  options={statusOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "AKTIF")}
                  placeholder="Pilih status"
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
