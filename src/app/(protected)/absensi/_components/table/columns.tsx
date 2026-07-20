import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TAbsensi } from "@/services/absensi/types";
import { KEHADIRAN_BADGE_CLASS } from "@/utils/status-badge";

interface IColumnProps {
  onEdit?: (row: TAbsensi) => void;
  onDelete?: (row: TAbsensi) => void;
  currentPage: number;
  pageSize: number;
}

export const createColumns = ({
  onEdit,
  onDelete,
  currentPage,
  pageSize,
}: IColumnProps): ColumnDef<TAbsensi>[] => {
  return [
    {
      header: "No",
      accessorKey: "no",
      cell: ({ row }) => {
        return <div>{(currentPage - 1) * pageSize + row.index + 1}</div>;
      },
    },
    {
      header: "Nama",
      accessorKey: "name",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original?.name ?? "-"}</span>;
      },
    },
    {
      header: "Divisi",
      accessorKey: "divisi",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original?.divisi ?? "-"}</span>;
      },
    },
    {
      header: "Pembimbing Lapangan",
      accessorKey: "pembimbingLapangan",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original?.pembimbingLapangan ?? "-"}</span>;
      },
    },
    {
      header: "Kehadiran",
      accessorKey: "kehadiran",
      cell: ({ row }) => {
        const kehadiran = row.original?.kehadiran;
        if (!kehadiran) return <span className="text-sm">-</span>;
        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              KEHADIRAN_BADGE_CLASS[kehadiran] ?? "bg-accent text-muted-foreground"
            }`}
          >
            {kehadiran}
          </span>
        );
      },
    },
    {
      header: "Tanggal",
      accessorKey: "tanggal",
      cell: ({ row }) => {
        return (
          <span className="text-sm">
            {DateTime.fromISO(row.original?.tanggal ?? "").toLocaleString(DateTime.DATE_MED)}
          </span>
        );
      },
    },
    {
      header: "Jam Masuk",
      accessorKey: "jamMasuk",
      cell: ({ row }) => {
        return (
          <span className="text-sm">
            {row.original?.jamMasuk
              ? DateTime.fromISO(row.original.jamMasuk).toLocaleString(DateTime.TIME_24_SIMPLE)
              : "-"}
          </span>
        );
      },
    },
    {
      header: "Jam Keluar",
      accessorKey: "jamKeluar",
      cell: ({ row }) => {
        return (
          <span className="text-sm">
            {row.original?.jamKeluar
              ? DateTime.fromISO(row.original.jamKeluar).toLocaleString(DateTime.TIME_24_SIMPLE)
              : "-"}
          </span>
        );
      },
    },
    {
      header: "",
      accessorKey: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icon icon="lucide:more-vertical" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem
                  className="inline-flex items-center gap-2 cursor-pointer"
                  onClick={() => onEdit?.(row.original)}
                >
                  <Icon icon="lucide:pen" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="inline-flex items-center gap-2 cursor-pointer"
                  onClick={() => onDelete?.(row.original)}
                >
                  <Icon icon="lucide:trash" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
};
