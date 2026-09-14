"use client";

import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { queryKeys } from "@/constants/query-keys";
import { useQueryBuilder } from "@/hooks/use-query-builder";
import { services } from "@/services";
import type { TPesertaMagang } from "@/services/peserta-magang/types";
import { useAuth } from "@/stores/auth";
import { FormDialog } from "../form-dialog";
import { createColumns } from "./columns";

export default function TablePesertaMagang() {
  const queryClient = useQueryClient();
  const isAdmin = useAuth((s) => s.user?.role) === "Admin";
  const { params, page, rows, setPage, setSearch } = useQueryBuilder({
    defaultSearchKeys: ["name"],
  });

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<TPesertaMagang | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TPesertaMagang | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.pesertaMagang.list(params),
    queryFn: () => services.pesertaMagang.getAllPesertaMagang(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => services.pesertaMagang.deletePesertaMagang(id),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.pesertaMagang.all });
      setDeleteTarget(null);
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const debouncedSearch = useMemo(() => debounce(setSearch, 400), [setSearch]);

  const columns = createColumns({
    onEdit: (row) => {
      setSelected(row);
      setFormOpen(true);
    },
    // Admin-only server-side too (peserta-magang routes) — this just avoids
    // offering an action that would come back 403.
    onDelete: isAdmin ? (row) => setDeleteTarget(row) : undefined,
    currentPage: page,
    pageSize: rows,
  });

  const entries = data?.content?.entries ?? [];
  const totalData = data?.content?.totalData ?? 0;
  const totalPage = data?.content?.totalPage ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peserta Magang</CardTitle>
        <CardDescription>Daftar peserta magang yang terdaftar di sistem.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <InputGroup className="w-full sm:max-w-sm">
            <InputGroupInput
              placeholder="Cari nama peserta..."
              onChange={(e) => debouncedSearch(e.target.value)}
            />
            <InputGroupAddon align="inline-start">
              <Icon icon="lucide:search" />
            </InputGroupAddon>
          </InputGroup>

          <Button
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <Icon icon="lucide:plus" />
            Tambah Peserta
          </Button>
        </div>

        <DataTable
          pagination={{
            currentPage: page,
            totalPages: totalPage,
            onPageChange: setPage,
            isFetching,
          }}
          columns={columns}
          data={entries}
          totalData={totalData}
          loading={isFetching}
        />
      </CardContent>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} peserta={selected} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Peserta Magang?"
        description={`Peserta "${deleteTarget?.name}" akan dihapus permanen, beserta seluruh absensi, logbook, penilaian, dan dokumennya. Untuk mengakhiri magang, ubah statusnya menjadi Selesai.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </Card>
  );
}
