"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { services } from "@/services";
import {
  schemaPortalJurnalRequest,
  type TPortalJurnal,
  type TPortalJurnalRequest,
} from "@/services/portal/types";
import { todayIsoDate } from "@/utils/datetime";

interface JurnalFormProps {
  onSaved: () => void;
  editing?: TPortalJurnal | null;
  onCancelEdit?: () => void;
}

export default function JurnalForm({ onSaved, editing, onCancelEdit }: JurnalFormProps) {
  const today = todayIsoDate();
  const isEdit = !!editing;

  const form = useForm<TPortalJurnalRequest>({
    resolver: zodResolver(schemaPortalJurnalRequest),
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
    mutationFn: (value: TPortalJurnalRequest) => services.portal.createJurnal(value),
    onSuccess: (res) => {
      toast.success(res.message);
      form.reset({ tanggal: today, kegiatan: "" });
      onSaved();
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: (kegiatan: string) => services.portal.updateJurnal(editing!.id, kegiatan),
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon icon="mdi:notebook-edit-outline" className="size-4" />
          {isEdit ? "Edit Jurnal Kegiatan" : "Tulis Jurnal Kegiatan"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup className="flex flex-col gap-4">
            <Controller
              control={form.control}
              name="tanggal"
              render={({ field, fieldState: { error } }) => (
                <Field>
                  <FieldLabel>Tanggal</FieldLabel>
                  {/* max=today: the API rejects future dates, so the picker
                      shouldn't offer them either. Date is locked while editing
                      — only kegiatan may change. */}
                  <Input type="date" max={today} disabled={isEdit} {...field} />
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
                  <Textarea rows={4} placeholder="Apa yang Anda kerjakan hari ini..." {...field} />
                  <FieldError errors={[error]} />
                </Field>
              )}
            />

            <div className="flex flex-wrap gap-2">
              <Button type="submit" className="w-fit" disabled={isPending} isLoading={isPending}>
                {isEdit ? "Simpan Perubahan" : "Simpan Jurnal"}
              </Button>
              {isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancelEdit}
                  disabled={isPending}
                >
                  Batal
                </Button>
              )}
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
