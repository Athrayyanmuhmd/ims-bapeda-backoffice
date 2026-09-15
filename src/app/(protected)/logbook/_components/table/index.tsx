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
import type { TLogbook } from "@/services/logbook/types";
import { FormDialog } from "../form-dialog";
import { createColumns } from "./columns";

export default function TableLogbook() {
  const queryClient = useQueryClient();
  const { params, page, rows, setPage, setSearch } = useQueryBuilder({
    defaultSearchKeys: ["name"],
  });

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<TLogbook | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TLogbook | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.logbook.list(params),
    queryFn: () => services.logbook.getAllLogbook(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => services.logbook.deleteLogbook(id),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.logbook.all });
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
        eyebrow="Kegiatan"
        title="Logbook"
        description="Logbook harian kegiatan peserta magang."
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
              Tambah Logbook
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

      <FormDialog open={formOpen} onOpenChange={setFormOpen} logbook={selected} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Logbook?"
        description={`Logbook Kegiatan "${deleteTarget?.name}" pada tanggal tersebut akan dihapus permanen.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
