import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TPenilaian } from "@/services/penilaian/types";

interface IColumnProps {
  onEdit?: (row: TPenilaian) => void;
  onDelete?: (row: TPenilaian) => void;
  currentPage: number;
  pageSize: number;
}

const nilaiClass = (nilai: number) => {
  if (nilai >= 80) return "text-green-600 bg-green-50";
  if (nilai >= 60) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
};

export const createColumns = ({
  onEdit,
  onDelete,
  currentPage,
  pageSize,
}: IColumnProps): ColumnDef<TPenilaian>[] => {
  return [
    {
      header: "No",
      accessorKey: "no",
      cell: ({ row }) => {
        return <div>{(currentPage - 1) * pageSize + row.index + 1}</div>;
      },
    },
    {
      header: "Nama Peserta",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-sm">{row.original.divisi ?? "-"}</span>
        </div>
      ),
    },
    {
      header: "Nilai",
      accessorKey: "nilai",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${nilaiClass(row.original.nilai)}`}
        >
          {row.original.nilai}
        </span>
      ),
    },
    {
      header: "Penilai",
      accessorKey: "penilai",
      cell: ({ row }) => <span className="text-sm">{row.original.penilai}</span>,
    },
    {
      header: "Komentar",
      accessorKey: "komentar",
      cell: ({ row }) => (
        <span className="text-sm line-clamp-2 max-w-md">{row.original.komentar || "-"}</span>
      ),
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
