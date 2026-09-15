"use client";

import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table";
import { ListPageCard } from "@/components/list-page-card";
import { ListToolbar } from "@/components/list-toolbar";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/constants/query-keys";
import { useQueryBuilder } from "@/hooks/use-query-builder";
import { services } from "@/services";
import type { TPenilaian } from "@/services/penilaian/types";
import { FormDialog } from "../form-dialog";
import { createColumns } from "./columns";

export default function TablePenilaian() {
  const queryClient = useQueryClient();
  const { params, page, rows, setPage, setSearch } = useQueryBuilder({
    defaultSearchKeys: ["name"],
  });

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<TPenilaian | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TPenilaian | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.penilaian.list(params),
    queryFn: () => services.penilaian.getAllPenilaian(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => services.penilaian.deletePenilaian(id),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.penilaian.all });
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
        eyebrow="Evaluasi"
        title="Penilaian"
        description="Nilai dan komentar akhir dari pembimbing untuk peserta magang."
        icon="mdi:star-outline"
      />

      <ListPageCard>
        <ListToolbar
          searchPlaceholder="Cari nama peserta..."
          onSearch={debouncedSearch}
          action={
            <Button
              onClick={() => {
                setSelected(null);
                setFormOpen(true);
              }}
            >
              <Icon icon="lucide:plus" />
              Tambah Penilaian
            </Button>
          }
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

      <FormDialog open={formOpen} onOpenChange={setFormOpen} penilaian={selected} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Penilaian?"
        description={`Penilaian untuk "${deleteTarget?.name}" akan dihapus permanen.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
