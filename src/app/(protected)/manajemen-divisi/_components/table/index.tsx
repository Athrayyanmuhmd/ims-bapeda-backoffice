"use client";

import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table";
import { SimpleFormDialog } from "@/components/simple-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { queryKeys } from "@/constants/query-keys";
import { useQueryBuilder } from "@/hooks/use-query-builder";
import { services } from "@/services";
import type { TDivisi } from "@/services/divisi/types";
import { createColumns } from "./columns";

export default function TableManajemenDivisi() {
  const queryClient = useQueryClient();
  const { params, page, rows, setPage, setSearch } = useQueryBuilder({
    defaultSearchKeys: ["name"],
  });

  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<TDivisi | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TDivisi | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.divisi.list(params),
    queryFn: () => services.divisi.getAllDivisi(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => services.divisi.deleteDivisi(id),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.divisi.all });
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
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Divisi</CardTitle>
        <CardDescription>Daftar divisi yang terdaftar di sistem.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <InputGroup className="max-w-sm">
            <InputGroupInput
              placeholder="Cari nama divisi..."
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
            Tambah Divisi
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

      <SimpleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        entity={selected}
        label="Divisi"
        queryKey={queryKeys.divisi.all}
        create={services.divisi.createDivisi}
        update={services.divisi.updateDivisi}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Divisi?"
        description={`Divisi "${deleteTarget?.name}" akan dihapus permanen.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </Card>
  );
}
