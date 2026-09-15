import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TAbsensi } from "@/services/absensi/types";
import { fmtJam, fmtTanggal } from "@/utils/datetime";
import { KEHADIRAN_BADGE_CLASS, IZIN_STATUS_BADGE_CLASS, BADGE_SIZE_CLASS } from "@/utils/status-badge";

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
        const izinStatus = row.original?.izinStatus;
        if (!kehadiran) return <span className="text-sm">-</span>;
        if (izinStatus === "PENDING") {
          return (
            <span className={`${BADGE_SIZE_CLASS} min-w-[7.25rem] ${IZIN_STATUS_BADGE_CLASS.PENDING}`}>
              Menunggu {row.original.izinJenis ?? kehadiran}
            </span>
          );
        }
        return (
          <span
            className={`${BADGE_SIZE_CLASS} ${
              KEHADIRAN_BADGE_CLASS[kehadiran] ?? "bg-[#EEF2F3] text-[#5C6B72]"
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
        return <span className="text-sm">{fmtTanggal(row.original?.tanggal)}</span>;
      },
    },
    {
      header: "Jam Masuk",
      accessorKey: "jamMasuk",
      cell: ({ row }) => {
        return <span className="text-sm">{fmtJam(row.original?.jamMasuk)}</span>;
      },
    },
    {
      header: "Jam Keluar",
      accessorKey: "jamKeluar",
      cell: ({ row }) => {
        return <span className="text-sm">{fmtJam(row.original?.jamKeluar)}</span>;
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
