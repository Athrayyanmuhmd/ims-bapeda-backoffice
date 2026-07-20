import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TInstansi } from "@/services/instansi/types";

interface IColumnProps {
  onEdit?: (row: TInstansi) => void;
  onDelete?: (row: TInstansi) => void;
  currentPage: number;
  pageSize: number;
}

export const createColumns = ({
  onEdit,
  onDelete,
  currentPage,
  pageSize,
}: IColumnProps): ColumnDef<TInstansi>[] => {
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
      accessorKey: "nama",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original?.nama ?? "-"}</span>;
      },
    },
    {
      header: "Jenis",
      accessorKey: "jenis",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original?.jenis ?? "-"}</span>;
      },
    },
    {
      header: "Alamat",
      accessorKey: "alamat",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original?.alamat ?? "-"}</span>;
      },
    },
    {
      header: "Nama PIC",
      accessorKey: "namaPic",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original?.namaPic ?? "-"}</span>;
      },
    },
    {
      header: "No. HP PIC",
      accessorKey: "noHpPic",
      cell: ({ row }) => {
        return <span className="text-sm tabular-nums">{row.original?.noHpPic ?? "-"}</span>;
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
