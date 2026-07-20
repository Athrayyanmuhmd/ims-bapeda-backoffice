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
import type { TJurnal } from "@/services/jurnal/types";

interface IColumnProps {
  onEdit?: (row: TJurnal) => void;
  onDelete?: (row: TJurnal) => void;
  currentPage: number;
  pageSize: number;
}

export const createColumns = ({
  onEdit,
  onDelete,
  currentPage,
  pageSize,
}: IColumnProps): ColumnDef<TJurnal>[] => {
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
      header: "Tanggal",
      accessorKey: "tanggal",
      cell: ({ row }) =>
        DateTime.fromISO(row.original.tanggal).toLocaleString(DateTime.DATE_MED),
    },
    {
      header: "Kegiatan",
      accessorKey: "kegiatan",
      cell: ({ row }) => (
        <span
          className="line-clamp-2 max-w-md text-sm whitespace-normal"
          title={row.original.kegiatan}
        >
          {row.original.kegiatan}
        </span>
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
