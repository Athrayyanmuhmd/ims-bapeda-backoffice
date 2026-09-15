"use client";

import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "@/utils/debounce";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table";
import { ListFilters } from "@/components/list-filters";
import { ListPageCard } from "@/components/list-page-card";
import { ListToolbar } from "@/components/list-toolbar";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/constants/query-keys";
import { useQueryBuilder } from "@/hooks/use-query-builder";
import { services } from "@/services";
import type { TDokumen } from "@/services/dokumen/types";
import { FormDialog } from "../form-dialog";
import { createColumns } from "./columns";

export default function TableDokumen() {
  const queryClient = useQueryClient();
  const { params, page, rows, setPage, setSearch, setFilter, filters } = useQueryBuilder({
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
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Berkas"
        title="Dokumen"
        description="Surat pengantar, surat balasan, sertifikat, dan laporan peserta magang."
        icon="mdi:file-document-outline"
        actions={
          <Button className="w-full sm:w-auto" onClick={() => setFormOpen(true)}>
            <Icon icon="lucide:plus" />
            Tambah Dokumen
          </Button>
        }
      />

      <ListPageCard>
        <ListToolbar
          searchPlaceholder="Cari nama peserta..."
          onSearch={debouncedSearch}
          filters={<ListFilters values={filters} onChange={setFilter} />}
        />

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
      </ListPageCard>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Dokumen?"
        description={`Dokumen "${deleteTarget?.namaFile}" akan dihapus permanen.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
