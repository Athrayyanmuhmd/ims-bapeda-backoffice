import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TDokumen } from "@/services/dokumen/types";

interface IColumnProps {
  onDelete?: (row: TDokumen) => void;
  currentPage: number;
  pageSize: number;
}

export const createColumns = ({
  onDelete,
  currentPage,
  pageSize,
}: IColumnProps): ColumnDef<TDokumen>[] => {
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
      cell: ({ row }) => <span className="text-sm">{row.original.name}</span>,
    },
    {
      header: "Jenis",
      accessorKey: "jenisDokumen",
      cell: ({ row }) => (
        <span className="bg-accent inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
          {row.original.jenisDokumen.replaceAll("_", " ")}
        </span>
      ),
    },
    {
      header: "Nama File",
      accessorKey: "namaFile",
      cell: ({ row }) => <span className="text-sm">{row.original.namaFile}</span>,
    },
    {
      header: "Link",
      accessorKey: "urlFile",
      cell: ({ row }) => (
        <a
          href={row.original.urlFile}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
        >
          <Icon icon="lucide:external-link" className="size-3.5" />
          Buka
        </a>
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
