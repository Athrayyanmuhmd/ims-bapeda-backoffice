"use client";

import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { services } from "@/services";
import type { TPortalAbsensi, TPortalPeserta } from "@/services/portal/types";
import { cn } from "@/utils/classname";
import { APP_TIMEZONE, fmtJam, todayIsoDate } from "@/utils/datetime";

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const;

const STATUS_STYLE: Record<string, string> = {
  Hadir: "bg-[#1B6B4A] text-white",
  Sakit: "bg-[#B85C1A] text-white",
  Izin: "bg-[#2F4F8A] text-white",
  Alpa: "bg-[#A33B3B] text-white",
  PENDING: "bg-[#C9A227] text-white",
};

const LEGEND = [
  { key: "Hadir", className: "bg-[#1B6B4A]" },
  { key: "Izin", className: "bg-[#2F4F8A]" },
  { key: "Sakit", className: "bg-[#B85C1A]" },
  { key: "Alpa", className: "bg-[#A33B3B]" },
  { key: "Menunggu", className: "bg-[#C9A227]" },
] as const;

function tanggalKey(iso: string) {
  return iso.slice(0, 10);
}

function statusOf(row: TPortalAbsensi | undefined) {
  if (!row) return null;
  if (row.izinStatus === "PENDING") return "PENDING";
  return row.kehadiran;
}

function labelOf(row: TPortalAbsensi) {
  if (row.izinStatus === "PENDING") return `Menunggu ${row.izinJenis ?? row.kehadiran}`;
  return row.kehadiran;
}

function formatJamRange(row: TPortalAbsensi) {
  if (!row.jamMasuk && !row.jamKeluar) return "—";
  if (row.jamMasuk && !row.jamKeluar) return `${fmtJam(row.jamMasuk)} · belum keluar`;
  return `${fmtJam(row.jamMasuk)} – ${fmtJam(row.jamKeluar)}`;
}

export default function KehadiranCalendar({ peserta }: { peserta: TPortalPeserta }) {
  const today = todayIsoDate();
  const startBound = peserta.tanggalMulai?.slice(0, 10) ?? today;
  const endBound = peserta.tanggalSelesai?.slice(0, 10) ?? today;

  const initialMonth = DateTime.fromISO(today, { zone: APP_TIMEZONE }).startOf("month");
  const [cursor, setCursor] = useState(initialMonth);
  const [selectedIso, setSelectedIso] = useState<string | null>(today);

  const { data, isLoading } = useQuery({
    queryKey: ["portal", "absensi", "full"] as const,
    queryFn: () => services.portal.getAbsensi(500),
  });

  const absensi = data?.content ?? [];

  const byDate = useMemo(() => {
    const map = new Map<string, TPortalAbsensi>();
    for (const row of absensi) {
      map.set(tanggalKey(row.tanggal), row);
    }
    return map;
  }, [absensi]);

  const monthStart = cursor.startOf("month");
  const monthEnd = cursor.endOf("month");
  // Luxon weekday: Mon=1 … Sun=7 → grid offset 0…6 with Monday first
  const lead = monthStart.weekday - 1;
  const cells: (DateTime | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= monthEnd.day; d++) {
    cells.push(monthStart.set({ day: d }));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const selected = selectedIso ? byDate.get(selectedIso) : undefined;
  const monthLabel = cursor.setLocale("id").toFormat("LLLL yyyy");

  const monthKey = cursor.toFormat("yyyy-MM");
  const startMonth = startBound.slice(0, 7);
  const endMonth = endBound.slice(0, 7);
  const canPrev = monthKey > startMonth;
  const canNext = monthKey < endMonth;

  const summary = useMemo(() => {
    const counts = { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0, PENDING: 0 };
    for (const row of absensi) {
      const key = tanggalKey(row.tanggal);
      if (!key.startsWith(cursor.toFormat("yyyy-MM"))) continue;
      const status = statusOf(row);
      if (status && status in counts) counts[status as keyof typeof counts] += 1;
    }
    return counts;
  }, [absensi, cursor]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#E7F0F2_0%,_#F7F4EF_45%,_#F3EFE7_100%)]">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-5 pb-10 sm:pt-8">
        <header className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="border-[#CFD8DB]">
            <Link href="/portal" aria-label="Kembali">
              <Icon icon="mdi:arrow-left" className="size-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-semibold tracking-tight text-[#1C2A30]">
              Kalender kehadiran
            </h1>
          </div>
        </header>

        <section className="rounded-2xl border border-[#E4E0D8] bg-[#FFFEFB] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="icon"
              className="border-[#CFD8DB]"
              disabled={!canPrev}
              onClick={() => setCursor((m) => m.minus({ months: 1 }))}
              aria-label="Bulan sebelumnya"
            >
              <Icon icon="mdi:chevron-left" />
            </Button>
            <h2 className="font-display text-lg font-semibold capitalize text-[#0F4C5C]">
              {monthLabel}
            </h2>
            <Button
              variant="outline"
              size="icon"
              className="border-[#CFD8DB]"
              disabled={!canNext}
              onClick={() => setCursor((m) => m.plus({ months: 1 }))}
              aria-label="Bulan berikutnya"
            >
              <Icon icon="mdi:chevron-right" />
            </Button>
          </div>

          {isLoading ? (
            <Skeleton className="h-72 w-full rounded-xl" />
          ) : (
            <>
              <div className="mb-2 grid grid-cols-7 gap-1.5">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="py-1 text-center text-[10px] font-semibold tracking-wide text-[#7A8790] uppercase"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const iso = day.toISODate()!;
                  const row = byDate.get(iso);
                  const status = statusOf(row);
                  const inPeriod = iso >= startBound && iso <= endBound;
                  const isToday = iso === today;
                  const isSelected = iso === selectedIso;
                  const isWeekend = day.weekday >= 6;
                  const isFuture = iso > today;

                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={!inPeriod}
                      onClick={() => setSelectedIso(iso)}
                      className={cn(
                        "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors",
                        !inPeriod && "opacity-25",
                        inPeriod && !status && (isWeekend ? "bg-[#F0ECE4]" : "bg-[#F7F4EF]"),
                        inPeriod && status && STATUS_STYLE[status],
                        isSelected && "ring-2 ring-[#0F4C5C] ring-offset-2",
                        isToday && !status && "ring-1 ring-[#0F4C5C]/40",
                        isFuture && inPeriod && !status && "text-[#9AA4AA]"
                      )}
                    >
                      <span
                        className={cn(
                          "font-display text-sm font-semibold tabular-nums",
                          status ? "text-white" : "text-[#1C2A30]"
                        )}
                      >
                        {day.day}
                      </span>
                      {status && (
                        <span className="mt-0.5 hidden text-[9px] font-medium text-white/90 sm:block">
                          {status === "PENDING" ? "…" : status.slice(0, 1)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {LEGEND.map((item) => (
                  <div key={item.key} className="flex items-center gap-1.5 text-xs text-[#5C6B72]">
                    <span className={cn("size-2.5 rounded-full", item.className)} />
                    {item.key}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-[#E4E0D8] bg-[#FFFEFB] p-4 sm:p-5">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#0F4C5C]/70 uppercase">
            Detail hari
          </p>
          <h3 className="font-display mt-1 text-lg font-semibold text-[#1C2A30]">
            {selectedIso
              ? DateTime.fromISO(selectedIso, { zone: "utc" })
                  .setLocale("id")
                  .toFormat("cccc, d LLLL yyyy")
              : "Pilih tanggal"}
          </h3>

          {!selectedIso ? (
            <p className="mt-3 text-sm text-[#5C6B72]">Ketuk tanggal di kalender.</p>
          ) : !selected ? (
            <p className="mt-3 text-sm text-[#5C6B72]">
              {selectedIso > today
                ? "Belum terjadi."
                : selectedIso < startBound || selectedIso > endBound
                  ? "Di luar periode magang."
                  : "Tidak ada catatan kehadiran."}
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <div className="rounded-xl bg-[#F7F4EF] px-3 py-3">
                <p className="text-[11px] text-[#5C6B72] uppercase">Status</p>
                <p className="mt-1 font-medium text-[#1C2A30]">{labelOf(selected)}</p>
              </div>
              <div className="rounded-xl bg-[#F7F4EF] px-3 py-3">
                <p className="text-[11px] text-[#5C6B72] uppercase">Masuk</p>
                <p className="mt-1 font-display text-lg font-semibold tabular-nums text-[#0F4C5C]">
                  {fmtJam(selected.jamMasuk)}
                </p>
              </div>
              <div className="col-span-2 rounded-xl bg-[#F7F4EF] px-3 py-3 sm:col-span-1">
                <p className="text-[11px] text-[#5C6B72] uppercase">Keluar</p>
                <p className="mt-1 font-display text-lg font-semibold tabular-nums text-[#0F4C5C]">
                  {fmtJam(selected.jamKeluar)}
                </p>
              </div>
              {selected.keterangan && (
                <div className="col-span-2 rounded-xl bg-[#F7F4EF] px-3 py-3 sm:col-span-3">
                  <p className="text-[11px] text-[#5C6B72] uppercase">Keterangan</p>
                  <p className="mt-1 text-sm text-[#1C2A30]">{selected.keterangan}</p>
                </div>
              )}
              <p className="col-span-2 text-xs text-[#7A8790] sm:col-span-3">
                {formatJamRange(selected)}
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#E4E0D8] bg-[#FFFEFB] p-4 sm:p-5">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#0F4C5C]/70 uppercase">
            Ringkasan bulan ini
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {(
              [
                ["Hadir", summary.Hadir],
                ["Izin", summary.Izin],
                ["Sakit", summary.Sakit],
                ["Alpa", summary.Alpa],
                ["Menunggu", summary.PENDING],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-xl bg-[#F7F4EF] px-3 py-2.5 text-center">
                <p className="font-display text-xl font-semibold tabular-nums text-[#0F4C5C]">
                  {value}
                </p>
                <p className="text-[11px] text-[#5C6B72]">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
