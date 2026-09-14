"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { SingleSelect } from "@/components/single-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";
import {
  STATUS_MAGANG_OPTIONS,
  schemaUpdatePesertaMagangRequest,
  type TPesertaMagang,
  type TUpdatePesertaMagangForm,
  type TUpdatePesertaMagangRequest,
} from "@/services/peserta-magang/types";
import { toDateInput } from "@/utils/datetime";
import { useAuth } from "@/stores/auth";

const STATUS_LABEL: Record<(typeof STATUS_MAGANG_OPTIONS)[number], string> = {
  AKTIF: "Aktif",
  SELESAI: "Selesai",
  BERHENTI: "Berhenti",
};

const EMPTY_FORM: TUpdatePesertaMagangForm = {
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
  portalPassword: "",
  revokePortalAccess: false,
};

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peserta?: TPesertaMagang | null;
}

function toApiPayload(value: TUpdatePesertaMagangForm): TUpdatePesertaMagangRequest {
  const { revokePortalAccess, portalPassword, ...rest } = value;

  if (revokePortalAccess) {
    return { ...rest, portalPassword: null };
  }

  if (portalPassword) {
    return { ...rest, portalPassword };
  }

  // Omit blank password so an edit that doesn't touch the portal leaves it alone.
  return rest;
}

export function FormDialog({ open, onOpenChange, peserta }: FormDialogProps) {
  const isEdit = !!peserta;
  const queryClient = useQueryClient();
  const isAdmin = useAuth((s) => s.user?.role) === "Admin";

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
    enabled: open && isAdmin,
  });

  const divisiOptions = (divisiData?.content?.entries ?? []).map((d) => ({
    label: d.name,
    value: d.id,
  }));
  const instansiOptions = (instansiData?.content?.entries ?? []).map((i) => ({
    label: i.nama,
    value: i.id,
  }));
  const pembimbingOptions = (userData?.content?.entries ?? [])
    .filter((u) => u.role === "Pembimbing" && u.status === "active")
    .map((u) => ({
      label: u.fullName,
      value: u.id,
    }));
  const statusOptions = STATUS_MAGANG_OPTIONS.map((v) => ({ label: STATUS_LABEL[v], value: v }));

  const form = useForm<TUpdatePesertaMagangForm>({
    resolver: zodResolver(schemaUpdatePesertaMagangRequest),
    defaultValues: EMPTY_FORM,
  });

  const revokePortalAccess = useWatch({ control: form.control, name: "revokePortalAccess" });

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
        tanggalMulai: toDateInput(peserta?.tanggalMulai),
        tanggalSelesai: toDateInput(peserta?.tanggalSelesai),
        status: peserta?.status ?? "AKTIF",
        portalPassword: "",
        revokePortalAccess: false,
      });
    }
  }, [open, peserta, form]);

  const mutation = useMutation({
    mutationFn: (data: TUpdatePesertaMagangRequest) => {
      if (isEdit) return services.pesertaMagang.updatePesertaMagang(peserta.id, data);
      const { portalPassword, ...rest } = data;
      return services.pesertaMagang.createPesertaMagang({
        ...rest,
        ...(typeof portalPassword === "string" && portalPassword
          ? { portalPassword }
          : {}),
      });
    },
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.pesertaMagang.all });
      onOpenChange(false);
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const onSubmit = form.handleSubmit((value) => mutation.mutate(toApiPayload(value)));

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Peserta Magang" : "Tambah Peserta Magang"}
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          {isAdmin && (
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
                    placeholder={
                      pembimbingOptions.length
                        ? "Pilih pembimbing lapangan"
                        : "Belum ada user berrole Pembimbing"
                    }
                  />
                  <FieldError errors={[error]} />
                  <p className="text-muted-foreground text-xs">
                    Hanya menampilkan user berrole Pembimbing. Tambah lewat Manajemen User.
                  </p>
                </Field>
              )}
            />
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div className="bg-muted/40 flex flex-col gap-3 rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon icon="mdi:account-key-outline" className="size-4" />
                Akses Portal Peserta
              </div>
              {isEdit && (
                <span
                  className={
                    peserta?.hasPortalAccount
                      ? "rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"
                      : "rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700"
                  }
                >
                  {peserta?.hasPortalAccount ? "Aktif" : "Belum aktif"}
                </span>
              )}
            </div>

            <p className="text-muted-foreground text-xs">
              Peserta login di <span className="font-medium">/portal</span> dengan email di atas.
              {isEdit
                ? " Isi password untuk mengaktifkan atau mereset. Kosongkan jika tidak ingin mengubah."
                : " Opsional: isi password untuk langsung mengaktifkan akun portal."}
            </p>

            {isEdit && peserta?.hasPortalAccount && (
              <Controller
                control={form.control}
                name="revokePortalAccess"
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked === true);
                        if (checked === true) form.setValue("portalPassword", "");
                      }}
                    />
                    Cabut akses portal (peserta tidak bisa login lagi)
                  </label>
                )}
              />
            )}

            <Controller
              control={form.control}
              name="portalPassword"
              render={({ field, fieldState: { error } }) => (
                <Field>
                  <FieldLabel>
                    {isEdit && peserta?.hasPortalAccount
                      ? "Password portal baru"
                      : "Password portal"}
                  </FieldLabel>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                    disabled={!!revokePortalAccess}
                    {...field}
                  />
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
