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
import type { TPesertaMagang } from "@/services/peserta-magang/types";
import { useAuth } from "@/stores/auth";
import { FormDialog } from "../form-dialog";
import { createColumns } from "./columns";

export default function TablePesertaMagang() {
  const queryClient = useQueryClient();
  const isAdmin = useAuth((s) => s.user?.role) === "Admin";
  const { params, page, rows, setPage, setSearch, setFilter, filters } = useQueryBuilder({
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
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Operasional"
        title="Peserta Magang"
        description="Daftar peserta magang yang terdaftar di sistem."
        icon="mynaui:book-user"
        actions={
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          >
            <Icon icon="lucide:plus" />
            Tambah Peserta
          </Button>
        }
      />

      <ListPageCard>
        <ListToolbar
          searchPlaceholder="Cari nama peserta..."
          onSearch={debouncedSearch}
          filters={<ListFilters values={filters} onChange={setFilter} showStatus />}
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

      <FormDialog open={formOpen} onOpenChange={setFormOpen} peserta={selected} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Peserta Magang?"
        description={`Peserta "${deleteTarget?.name}" akan dihapus permanen, beserta seluruh absensi, logbook, penilaian, dan dokumennya. Untuk mengakhiri magang, ubah statusnya menjadi Selesai.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
