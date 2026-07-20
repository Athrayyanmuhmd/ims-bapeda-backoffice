"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Header,
  type HeaderGroup,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isFetching?: boolean;
  };
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  loading?: boolean;
  totalData?: number;
  onClickRow?: (row: TData) => void;
  hideFooter?: boolean;
}

function DraggableRow<TData>({
  row,
  onClickRow,
}: {
  row: Row<TData>;
  onClickRow?: (row: TData) => void;
}) {
  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Don't trigger row click if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("[role='button']")) {
      return;
    }

    if (onClickRow) {
      onClickRow(row.original);
    }
  };

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      className={`relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 ${
        onClickRow ? "cursor-pointer hover:bg-accent/50" : ""
      }`}
      onClick={handleRowClick}
    >
      {row.getVisibleCells().map((cell: ReturnType<Row<TData>["getVisibleCells"]>[number]) => (
        <TableCell key={cell.id} className="h-12 px-4 py-2">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable<TData>({
  data: initialData,
  columns,
  pagination,
  onRowsPerPageChange,
  rowsPerPage = 10,
  rowsPerPageOptions = [10, 20, 30, 40, 50],
  loading = false,
  totalData,
  onClickRow,
  hideFooter = false,
}: DataTableProps<TData>) {
  const [data, setData] = useState(() => initialData);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalPagination, setInternalPagination] = useState({
    pageIndex: 0,
    pageSize: rowsPerPage,
  });

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: pagination ? undefined : internalPagination,
    },
    getRowId: (row: TData) => (row as unknown as { id: string }).id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: pagination ? undefined : setInternalPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: !!pagination,
    pageCount: pagination?.totalPages,
  });

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value);
    if (onRowsPerPageChange) {
      onRowsPerPageChange(newPageSize);
    } else {
      table.setPageSize(newPageSize);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (pagination) {
      pagination.onPageChange(newPage);
    } else {
      table.setPageIndex(newPage - 1);
    }
  };

  const currentPage = pagination
    ? pagination.currentPage
    : table.getState().pagination.pageIndex + 1;

  const totalPages = pagination ? pagination.totalPages : table.getPageCount();

  const totalDataCount = totalData || data.length;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex w-full flex-col justify-start gap-6">
      <div className="relative flex max-w-full min-w-0 flex-col gap-4">
        <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden">
          <div className="min-w-fit">
            <Table>
              <TableHeader className="bg-accent sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
                  <TableRow key={headerGroup.id} className="border-b-0">
                    {headerGroup.headers.map((header: Header<TData, unknown>) => {
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className="h-9 px-4 text-left"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {loading ? (
                  Array.from({ length: Math.min(rowsPerPage, 8) }).map((_, i) => (
                    <TableRow key={i}>
                      {columns.map((_, colIndex) => (
                        <TableCell key={colIndex} className="h-12 px-4 py-2">
                          <Skeleton className="h-4 w-full max-w-32" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table
                    .getRowModel()
                    .rows.map((row: Row<TData>) => (
                      <DraggableRow key={row.id} row={row} onClickRow={onClickRow} />
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {!hideFooter && (
        <div className="flex flex-col items-center gap-2.5 border-t py-2.5 sm:flex-row sm:justify-between">
          <p className="text-xs font-normal text-muted-foreground order-2 sm:order-1">Total Data: {totalDataCount}</p>
          <div className="order-1 flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-accent p-1 sm:order-2">
            <Button
              className="shrink-0 text-xs font-normal bg-white text-foreground hover:bg-accent"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || pagination?.isFetching}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>

            {pageNumbers.map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="shrink-0 px-2 text-xs text-muted-foreground">
                  •••
                </span>
              ) : (
                <Button
                  key={page}
                  size="sm"
                  className={`h-8 w-8 shrink-0 p-0 text-xs font-normal ${
                    currentPage === page
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-white text-foreground hover:bg-accent"
                  }`}
                  onClick={() => handlePageChange(page as number)}
                  disabled={pagination?.isFetching}
                >
                  {page}
                </Button>
              )
            )}

            <Button
              className="shrink-0 text-xs font-normal bg-white text-foreground hover:bg-accent"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || pagination?.isFetching}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="order-3 hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-xs font-normal text-muted-foreground">
              Tampilan per halaman
            </Label>
            <Select value={`${rowsPerPage}`} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20" id="rows-per-page">
                <SelectValue placeholder={rowsPerPage} />
              </SelectTrigger>
              <SelectContent>
                {rowsPerPageOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
