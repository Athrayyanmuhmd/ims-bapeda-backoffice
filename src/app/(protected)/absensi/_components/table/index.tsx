"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table";
import { ListFilters } from "@/components/list-filters";
import { ListPageCard } from "@/components/list-page-card";
import { ListToolbar } from "@/components/list-toolbar";
import { queryKeys } from "@/constants/query-keys";
import { useQueryBuilder } from "@/hooks/use-query-builder";
import { services } from "@/services";
import type { TAbsensi } from "@/services/absensi/types";
import { ExportCsv } from "../export-csv";
import { createColumns } from "./columns";

type TableAbsensiProps = {
  onEdit: (row: TAbsensi) => void;
};

export default function TableAbsensi({ onEdit }: TableAbsensiProps) {
  const queryClient = useQueryClient();
  const { params, page, rows, setPage, setSearch, setFilter, filters } = useQueryBuilder({
    defaultSearchKeys: ["name"],
  });

  const [deleteTarget, setDeleteTarget] = useState<TAbsensi | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.absensi.list(params),
    queryFn: () => services.absensi.getAllAbsensi(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => services.absensi.deleteAbsensi(id),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.absensi.all });
      setDeleteTarget(null);
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const debouncedSearch = useMemo(() => debounce(setSearch, 400), [setSearch]);

  const columns = createColumns({
    onEdit,
    onDelete: (row) => setDeleteTarget(row),
    currentPage: page,
    pageSize: rows,
  });

  const entries = data?.content?.entries ?? [];
  const totalData = data?.content?.totalData ?? 0;
  const totalPage = data?.content?.totalPage ?? 1;

  return (
    <ListPageCard>
      <ListToolbar
        searchPlaceholder="Cari nama peserta..."
        onSearch={debouncedSearch}
        filters={<ListFilters values={filters} onChange={setFilter} showKehadiran />}
        extras={<ExportCsv />}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Absensi?"
        description={`Absensi "${deleteTarget?.name}" pada tanggal tersebut akan dihapus permanen.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </ListPageCard>
  );
}
