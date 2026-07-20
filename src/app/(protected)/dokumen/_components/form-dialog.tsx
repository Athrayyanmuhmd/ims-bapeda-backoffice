"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { JENIS_DOKUMEN_OPTIONS, schemaCreateDokumenRequest, type TCreateDokumenRequest } from "@/services/dokumen/types";

const JENIS_LABEL: Record<(typeof JENIS_DOKUMEN_OPTIONS)[number], string> = {
  SURAT_PENGANTAR: "Surat Pengantar",
  SURAT_BALASAN: "Surat Balasan",
  SERTIFIKAT: "Sertifikat",
  LAPORAN: "Laporan",
  LAINNYA: "Lainnya",
};

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormDialog({ open, onOpenChange }: FormDialogProps) {
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

  const jenisOptions = JENIS_DOKUMEN_OPTIONS.map((v) => ({ label: JENIS_LABEL[v], value: v }));

  const form = useForm<TCreateDokumenRequest>({
    resolver: zodResolver(schemaCreateDokumenRequest),
    defaultValues: { pesertaMagangId: "", jenisDokumen: "", namaFile: "", urlFile: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ pesertaMagangId: "", jenisDokumen: "", namaFile: "", urlFile: "" });
    }
  }, [open, form]);

  const mutation = useMutation({
    mutationFn: (data: TCreateDokumenRequest) => services.dokumen.createDokumen(data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.dokumen.all });
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
      title="Tambah Dokumen"
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
                />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="jenisDokumen"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Jenis Dokumen</FieldLabel>
                <SingleSelect
                  options={jenisOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Pilih jenis dokumen"
                />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="namaFile"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Nama File</FieldLabel>
                <Input placeholder="Surat Pengantar Andi.pdf" {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="urlFile"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Link File</FieldLabel>
                <Input placeholder="https://drive.google.com/..." {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </Modal>
  );
}
