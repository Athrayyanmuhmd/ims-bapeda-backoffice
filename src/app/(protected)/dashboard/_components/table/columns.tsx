import type { ColumnDef } from "@tanstack/react-table";
import type { TAbsensi } from "@/services/absensi/types";
import { fmtTanggal } from "@/utils/datetime";
import { KEHADIRAN_BADGE_CLASS, BADGE_SIZE_CLASS } from "@/utils/status-badge";

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
        className={`${BADGE_SIZE_CLASS} ${
          KEHADIRAN_BADGE_CLASS[row.original.kehadiran] ?? "bg-[#EEF2F3] text-[#5C6B72]"
        }`}
      >
        {row.original.kehadiran}
      </span>
    ),
  },
];
