"use client";

import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table";
import { SimpleFormDialog } from "@/components/simple-form-dialog";
import { ListPageCard } from "@/components/list-page-card";
import { ListToolbar } from "@/components/list-toolbar";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/constants/query-keys";
import { useQueryBuilder } from "@/hooks/use-query-builder";
import { services } from "@/services";
import type { TRole } from "@/services/role/types";
import { createColumns } from "./columns";

export default function TableManajemenRole() {
  const queryClient = useQueryClient();
  const { params, page, rows, setPage, setSearch } = useQueryBuilder({
    defaultSearchKeys: ["name"],
  });

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<TRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TRole | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.role.list(params),
    queryFn: () => services.role.getAllRole(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => services.role.deleteRole(id),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.role.all });
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
        eyebrow="Administrasi"
        title="Manajemen Role"
        description="Daftar role yang terdaftar di sistem."
      />

      <ListPageCard>
        <ListToolbar
          searchPlaceholder="Cari nama role..."
          onSearch={debouncedSearch}
          action={
            <Button
              onClick={() => {
                setSelected(null);
                setFormOpen(true);
              }}
            >
              <Icon icon="lucide:plus" />
              Tambah Role
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Role?"
        description={`Role "${deleteTarget?.name}" akan dihapus permanen.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
