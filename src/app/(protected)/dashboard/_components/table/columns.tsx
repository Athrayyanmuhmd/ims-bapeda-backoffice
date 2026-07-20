import type { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";
import type { TAbsensi } from "@/services/absensi/types";
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
    cell: ({ row }) => (
      <span className="text-sm">{DateTime.fromISO(row.original.tanggal).toLocaleString(DateTime.DATE_MED)}</span>
    ),
  },
  {
    accessorKey: "kehadiran",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          KEHADIRAN_BADGE_CLASS[row.original.kehadiran] ?? "bg-accent text-muted-foreground"
        }`}
      >
        {row.original.kehadiran}
      </span>
    ),
  },
];
