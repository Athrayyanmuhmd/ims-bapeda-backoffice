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
import { schemaUpdateUserRequest, type TUpdateUserRequest, type TUser } from "@/services/user/types";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: TUser | null;
}

export function FormDialog({ open, onOpenChange, user }: FormDialogProps) {
  const isEdit = !!user;
  const queryClient = useQueryClient();

  const { data: divisiData } = useQuery({
    queryKey: queryKeys.divisi.options(),
    queryFn: () => services.divisi.getAllDivisi({ rows: 100 }),
    enabled: open,
  });

  const { data: roleData } = useQuery({
    queryKey: queryKeys.role.options(),
    queryFn: () => services.role.getAllRole({ rows: 100 }),
    enabled: open,
  });

  const divisiOptions = (divisiData?.content?.entries ?? []).map((d) => ({
    label: d.name,
    value: d.id,
  }));
  const roleOptions = (roleData?.content?.entries ?? []).map((r) => ({ label: r.name, value: r.id }));

  const form = useForm<TUpdateUserRequest>({
    resolver: zodResolver(schemaUpdateUserRequest),
    defaultValues: { fullName: "", email: "", password: "", phoneNumber: "", divisiId: "", roleId: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        fullName: user?.fullName ?? "",
        email: user?.email ?? "",
        password: "",
        phoneNumber: user?.phoneNumber ?? "",
        divisiId: user?.divisiId ?? "",
        roleId: user?.roleId ?? "",
        status: user?.status,
      });
    }
  }, [open, user, form]);

  const mutation = useMutation({
    mutationFn: (data: TUpdateUserRequest) => {
      if (isEdit) {
        const payload = { ...data };
        if (!payload.password) delete payload.password;
        return services.user.updateUser(user.id, payload);
      }
      if (!data.password) throw { message: "Password wajib diisi" };
      return services.user.createUser({ ...data, password: data.password });
    },
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
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
      title={isEdit ? "Edit User" : "Tambah User"}
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
            name="fullName"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Nama Lengkap</FieldLabel>
                <Input placeholder="Masukkan nama lengkap" {...field} />
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

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Password {isEdit && "(kosongkan jika tidak diubah)"}</FieldLabel>
                <Input type="password" placeholder="Masukkan password" {...field} />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

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
            name="roleId"
            render={({ field, fieldState: { error } }) => (
              <Field>
                <FieldLabel>Role</FieldLabel>
                <SingleSelect
                  options={roleOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "")}
                  placeholder="Pilih role"
                />
                <FieldError errors={[error]} />
              </Field>
            )}
          />

          {isEdit && (
            <Controller
              control={form.control}
              name="status"
              render={({ field, fieldState: { error } }) => (
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <SingleSelect
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                    ]}
                    value={field.value}
                    onChange={(v) => field.onChange(v ?? "active")}
                    placeholder="Pilih status"
                  />
                  <FieldError errors={[error]} />
                </Field>
              )}
            />
          )}
        </FieldGroup>
      </form>
    </Modal>
  );
}
