"use client";

import { DateTime } from "luxon";
import { KEHADIRAN_OPTIONS } from "@/services/absensi/types";
import { cn } from "@/utils/classname";

export interface RosterPeserta {
  pesertaMagangId: string;
  name: string;
  divisi: string | null;
  pembimbingLapangan: string | null;
  absensiId: string | null;
  kehadiran: (typeof KEHADIRAN_OPTIONS)[number] | null;
  jamMasuk: string | null;
}

const STATUS_CLASS: Record<string, string> = {
  Hadir: "border-green-600 bg-green-50 text-green-600",
  Sakit: "border-orange-600 bg-orange-50 text-orange-600",
  Izin: "border-blue-600 bg-blue-50 text-blue-600",
  Alpa: "border-red-600 bg-red-50 text-red-600",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

interface RosterItemProps {
  peserta: RosterPeserta;
  dense?: boolean;
  onMark: (kehadiran: (typeof KEHADIRAN_OPTIONS)[number]) => void;
  isPending?: boolean;
}

export function RosterItem({ peserta, dense, onMark, isPending }: RosterItemProps) {
  const borderClass = peserta.kehadiran ? STATUS_CLASS[peserta.kehadiran]?.split(" ")[0] : "border-border";

  return (
    <div
      className={cn(
        "bg-card flex gap-3 rounded-xl border shadow-sm",
        dense ? "flex-row items-center px-3 py-2" : "flex-col p-3.5",
        borderClass,
      )}
    >
      <div className={cn("flex items-center gap-2.5", dense && "min-w-0 flex-1")}>
        <div className="bg-accent flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
          {initials(peserta.name)}
        </div>
        <div className={cn(dense && "min-w-0")}>
          <p className={cn("truncate font-semibold", dense ? "text-sm" : "text-[0.88rem]")}>{peserta.name}</p>
          <p className="text-muted-foreground truncate text-xs">
            {peserta.divisi ?? "-"} · {peserta.pembimbingLapangan ?? "-"}
          </p>
        </div>
      </div>

      <div className={cn("grid grid-cols-4 gap-1.5", dense && "w-72 shrink-0")}>
        {KEHADIRAN_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            disabled={isPending}
            onClick={() => onMark(option)}
            className={cn(
              "rounded-lg border py-1.5 text-[0.7rem] font-bold whitespace-nowrap transition-colors disabled:opacity-50",
              peserta.kehadiran === option
                ? STATUS_CLASS[option]
                : "border-input text-muted-foreground hover:bg-accent",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "text-muted-foreground font-mono text-[0.7rem] tabular-nums",
          dense ? "w-24 shrink-0 text-right" : "min-h-[14px]",
        )}
      >
        {peserta.kehadiran === "Hadir" && peserta.jamMasuk
          ? `Masuk ${DateTime.fromISO(peserta.jamMasuk).toFormat("HH:mm")}`
          : peserta.kehadiran
            ? `Ditandai ${peserta.kehadiran}`
            : "Belum dicatat"}
      </div>
    </div>
  );
}
