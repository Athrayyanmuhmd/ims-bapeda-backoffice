"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/classname";
import { tanggalIsoDate, todayInApp, todayIsoDate } from "@/utils/datetime";
import { useDashboardData } from "../use-dashboard-data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const statusStyles: Record<string, { label: string; className: string }> = {
  Hadir: { label: "Hadir", className: "bg-[#E8F3EE] text-[#1B6B4A]" },
  Sakit: { label: "Sakit", className: "bg-[#FFF0E8] text-[#B45309]" },
  Izin: { label: "Izin", className: "bg-[#FFF6DB] text-[#8A6A12]" },
  Alpa: { label: "Alpa", className: "bg-[#FDECEC] text-[#B42318]" },
};

export default function TodayHighlight() {
  const today = todayInApp();

  const { pesertaData, absensiData, isLoading } = useDashboardData();

  const pesertaAktif = (pesertaData?.content?.entries ?? []).filter((p) => p.status === "AKTIF");
  const todayRecords = (absensiData?.content?.entries ?? []).filter(
    (a) => tanggalIsoDate(a.tanggal) === todayIsoDate()
  );
  const recordByPeserta = new Map(todayRecords.map((a) => [a.pesertaMagangId, a]));

  const roster = pesertaAktif
    .map((p) => {
      const record = recordByPeserta.get(p.id);
      return { ...p, record, belum: !record };
    })
    .sort((a, b) => {
      if (a.belum !== b.belum) return a.belum ? -1 : 1;
      return a.name.localeCompare(b.name, "id");
    });

  const belumCount = roster.filter((r) => r.belum).length;
  const allDone = !isLoading && pesertaAktif.length > 0 && belumCount === 0;

  return (
    <Card className="h-full gap-0 overflow-hidden border-[#E2E8EA] py-0 shadow-[0_1px_2px_rgba(15,76,92,0.04)]">
      <CardHeader className="gap-2 border-b border-[#EEF2F3] px-5 py-3.5 [.border-b]:pb-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#0F4C5C]/70 uppercase">
              Kehadiran
            </p>
            <h2 className="font-display text-base font-semibold tracking-tight text-[#1C2A30]">
              Absensi hari ini
            </h2>
            <p className="mt-0.5 text-sm text-[#5C6B72]">
              {today.setLocale("id").toFormat("cccc, d LLLL yyyy")}
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="shrink-0 border-[#CFD8DB] text-[#0F4C5C]"
          >
            <Link href="/absensi">
              Buka absensi
              <Icon icon="mdi:arrow-right" className="size-4" />
            </Link>
          </Button>
        </div>

        {!isLoading && pesertaAktif.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {allDone ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F3EE] px-2.5 py-1 text-xs font-medium text-[#1B6B4A]">
                <Icon icon="mdi:check-circle" className="size-3.5" />
                Semua peserta aktif sudah tercatat
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6DB] px-2.5 py-1 text-xs font-semibold text-[#8A6A12]">
                <Icon icon="mdi:clock-outline" className="size-3.5" />
                {belumCount} belum absen
              </span>
            )}
            <span className="text-xs text-[#7A8790]">
              {todayRecords.length} entri hari ini · {pesertaAktif.length} peserta aktif
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="px-5 py-3">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : pesertaAktif.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#CFD8DB] bg-[#FAFBFC] px-4 py-8 text-center">
            <p className="text-sm font-medium text-[#1C2A30]">Belum ada peserta aktif</p>
            <p className="mt-1 text-xs text-[#5C6B72]">
              Daftar peserta magang akan muncul di sini.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#EEF2F3] rounded-xl border border-[#E2E8EA] bg-white">
            {roster.map((item) => {
              const kehadiran = item.record?.kehadiran;
              const status = kehadiran ? statusStyles[kehadiran] : null;

              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 sm:px-4",
                    item.belum && "bg-[#FFFBF0]"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      item.belum
                        ? "bg-[#FFF6DB] text-[#8A6A12]"
                        : "bg-[#0F4C5C]/10 text-[#0F4C5C]"
                    )}
                  >
                    {initials(item.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#1C2A30]">{item.name}</p>
                    {item.belum ? (
                      <p className="text-xs text-[#8A6A12]">Menunggu pencatatan absensi</p>
                    ) : (
                      <p className="text-xs text-[#7A8790]">Tercatat hari ini</p>
                    )}
                  </div>
                  {item.belum ? (
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 px-2 text-xs font-semibold text-[#0F4C5C] hover:bg-[#0F4C5C]/5"
                    >
                      <Link href="/absensi">Catat</Link>
                    </Button>
                  ) : status ? (
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold",
                        status.className
                      )}
                    >
                      {status.label}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
