import type { ColumnDef } from "@tanstack/react-table";
import type { TAbsensi } from "@/services/absensi/types";
import { fmtTanggal } from "@/utils/datetime";
import { KEHADIRAN_BADGE_CLASS } from "@/utils/status-badge";

export const columns: ColumnDef<TAbsensi>[] = [
  {
    accessorKey: "name",
    header: "Nama Peserta",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "divisi",
    header: "Divisi",
    cell: ({ row }) => <span className="text-sm">{row.original.divisi ?? "-"}</span>,
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal",
    cell: ({ row }) => <span className="text-sm">{fmtTanggal(row.original.tanggal)}</span>,
  },
  {
    accessorKey: "kehadiran",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex w-16 items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
          KEHADIRAN_BADGE_CLASS[row.original.kehadiran] ?? "bg-accent text-muted-foreground"
        }`}
      >
        {row.original.kehadiran}
      </span>
    ),
  },
];
