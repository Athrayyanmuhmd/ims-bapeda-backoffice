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
import type { TDokumen } from "@/services/dokumen/types";
import { FormDialog } from "../form-dialog";
import { createColumns } from "./columns";

export default function TableDokumen() {
  const queryClient = useQueryClient();
  const { params, page, rows, setPage, setSearch } = useQueryBuilder({
    defaultSearchKeys: ["name"],
  });

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TDokumen | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.dokumen.list(params),
    queryFn: () => services.dokumen.getAllDokumen(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => services.dokumen.deleteDokumen(id),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.dokumen.all });
      setDeleteTarget(null);
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const debouncedSearch = useMemo(() => debounce(setSearch, 400), [setSearch]);

  const columns = createColumns({
    onDelete: (row) => setDeleteTarget(row),
    currentPage: page,
    pageSize: rows,
  });

  const entries = data?.content?.entries ?? [];
  const totalData = data?.content?.totalData ?? 0;
  const totalPage = data?.content?.totalPage ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dokumen</CardTitle>
        <CardDescription>Surat pengantar, surat balasan, sertifikat, dan laporan peserta magang.</CardDescription>
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

          <Button onClick={() => setFormOpen(true)}>
            <Icon icon="lucide:plus" />
            Tambah Dokumen
          </Button>
        </div>

        <DataTable
          pagination={{ currentPage: page, totalPages: totalPage, onPageChange: setPage, isFetching }}
          columns={columns}
          data={entries}
          totalData={totalData}
          loading={isFetching}
        />
      </CardContent>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Dokumen?"
        description={`Dokumen "${deleteTarget?.namaFile}" akan dihapus permanen.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </Card>
  );
}
