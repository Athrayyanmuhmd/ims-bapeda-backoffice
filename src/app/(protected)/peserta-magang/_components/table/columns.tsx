import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TPesertaMagang } from "@/services/peserta-magang/types";
import { STATUS_MAGANG_BADGE_CLASS } from "@/utils/status-badge";

interface IColumnProps {
  onEdit?: (row: TPesertaMagang) => void;
  onDelete?: (row: TPesertaMagang) => void;
  currentPage: number;
  pageSize: number;
}

export const createColumns = ({
  onEdit,
  onDelete,
  currentPage,
  pageSize,
}: IColumnProps): ColumnDef<TPesertaMagang>[] => {
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
      header: "Email",
      accessorKey: "email",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original?.email ?? "-"}</span>;
      },
    },
    {
      header: "No. HP",
      accessorKey: "phoneNumber",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original?.phoneNumber ?? "-"}</span>;
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
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original?.status;
        const className = STATUS_MAGANG_BADGE_CLASS[status] ?? "text-red-600 bg-red-50";
        return (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${className}`}>
            {status}
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
                <DropdownMenuItem asChild className="inline-flex items-center gap-2 cursor-pointer">
                  <Link href={`/peserta-magang/${row.original.id}`}>
                    <Icon icon="lucide:eye" />
                    <span>Detail</span>
                  </Link>
                </DropdownMenuItem>
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
