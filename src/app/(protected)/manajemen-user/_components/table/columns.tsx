import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TUser } from "@/services/user/types";

interface IColumnProps {
  onEdit?: (row: TUser) => void;
  onDelete?: (row: TUser) => void;
  currentPage: number;
  pageSize: number;
}

export const createColumns = ({
  onEdit,
  onDelete,
  currentPage,
  pageSize,
}: IColumnProps): ColumnDef<TUser>[] => {
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
      header: "Role",
      accessorKey: "role",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original?.role ?? "-"}</span>;
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        return <span className="text-sm capitalize">{row.original?.status ?? "-"}</span>;
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
