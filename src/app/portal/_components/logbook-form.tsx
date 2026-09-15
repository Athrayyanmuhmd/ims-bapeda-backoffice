"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { DateField } from "@/components/date-field";
import { services } from "@/services";
import {
  schemaPortalLogbookRequest,
  type TPortalLogbook,
  type TPortalLogbookRequest,
} from "@/services/portal/types";
import { cn } from "@/utils/classname";
import { todayIsoDate } from "@/utils/datetime";

interface LogbookFormProps {
  onSaved: () => void;
  editing?: TPortalLogbook | null;
  onCancelEdit?: () => void;
  embedded?: boolean;
}

export default function LogbookForm({
  onSaved,
  editing,
  onCancelEdit,
  embedded = false,
}: LogbookFormProps) {
  const today = todayIsoDate();
  const isEdit = !!editing;

  const form = useForm<TPortalLogbookRequest>({
    resolver: zodResolver(schemaPortalLogbookRequest),
    defaultValues: { tanggal: today, kegiatan: "" },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        tanggal: editing.tanggal.slice(0, 10),
        kegiatan: editing.kegiatan,
      });
    } else {
      form.reset({ tanggal: today, kegiatan: "" });
    }
  }, [editing, form, today]);

  const createMutation = useMutation({
    mutationFn: (value: TPortalLogbookRequest) => services.portal.createLogbook(value),
    onSuccess: (res) => {
      toast.success(res.message);
      form.reset({ tanggal: today, kegiatan: "" });
      onSaved();
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: (kegiatan: string) => services.portal.updateLogbook(editing!.id, kegiatan),
    onSuccess: (res) => {
      toast.success(res.message);
      onCancelEdit?.();
      onSaved();
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = form.handleSubmit((value) => {
    if (isEdit) {
      updateMutation.mutate(value.kegiatan);
      return;
    }
    createMutation.mutate(value);
  });

  return (
    <form onSubmit={onSubmit} className={cn("min-w-0 w-full", embedded ? "" : "rounded-2xl border p-4")}>
      {!embedded && (
        <h3 className="mb-3 font-display text-base font-semibold">
          {isEdit ? "Edit logbook" : "Tulis logbook"}
        </h3>
      )}

      <FieldGroup className="flex flex-col gap-3">
        <Controller
          control={form.control}
          name="tanggal"
          render={({ field, fieldState: { error } }) => (
            <Field>
              <DateField
                label="Tanggal"
                value={field.value}
                max={today}
                disabled={isEdit}
                onChange={field.onChange}
              />
              {!isEdit && (
                <p className="text-[11px] text-[#7A8790]">
                  Satu entri per hari. Tanggal lampau boleh diisi jika hari itu Hadir.
                </p>
              )}
              <FieldError errors={[error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="kegiatan"
          render={({ field, fieldState: { error } }) => (
            <Field>
              <FieldLabel className="text-[#5C6B72]">
                {isEdit ? "Ubah kegiatan" : "Kegiatan"}
              </FieldLabel>
              <Textarea
                rows={3}
                placeholder="Ringkas apa yang dikerjakan…"
                className="border-[#DFD9CF] bg-white"
                {...field}
              />
              <FieldError errors={[error]} />
            </Field>
          )}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            className="bg-[#0F4C5C] hover:bg-[#0C3D4A]"
            disabled={isPending}
            isLoading={isPending}
          >
            {isEdit ? "Simpan perubahan" : "Simpan logbook"}
          </Button>
          {isEdit && (
            <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isPending}>
              Batal
            </Button>
          )}
        </div>
      </FieldGroup>
    </form>
  );
}
