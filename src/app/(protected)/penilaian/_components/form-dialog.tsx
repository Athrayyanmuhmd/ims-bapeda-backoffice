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
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";
import {
  schemaCreatePenilaianRequest,
  type TCreatePenilaianRequest,
  type TPenilaian,
} from "@/services/penilaian/types";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  penilaian?: TPenilaian | null;
}

export function FormDialog({ open, onOpenChange, penilaian }: FormDialogProps) {
  const isEdit = !!penilaian;
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

  const form = useForm<TCreatePenilaianRequest>({
    resolver: zodResolver(schemaCreatePenilaianRequest),
    defaultValues: { pesertaMagangId: "", nilai: 0, komentar: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        pesertaMagangId: penilaian?.pesertaMagangId ?? "",
        nilai: penilaian?.nilai ?? 0,
        komentar: penilaian?.komentar ?? "",
      });
    }
  }, [open, penilaian, form]);

  const mutation = useMutation({
    mutationFn: (data: TCreatePenilaianRequest) =>
      isEdit
        ? services.penilaian.updatePenilaian(penilaian.id, { nilai: data.nilai, komentar: data.komentar })
        : services.penilaian.createPenilaian(data),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.penilaian.all });
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
      title={isEdit ? "Edit Penilaian" : "Tambah Penilaian"}
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
            name="nilai"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Nilai (0-100)</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="komentar"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Komentar</FieldLabel>
                <Textarea placeholder="Catatan penilaian (opsional)" rows={4} {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />
        </FieldGroup>
      </form>
    </Modal>
  );
}
