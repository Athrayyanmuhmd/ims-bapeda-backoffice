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

export default function TodayHighlight() {
  const today = todayInApp();

  const { pesertaData, absensiData, isLoading } = useDashboardData();

  const pesertaAktif = (pesertaData?.content?.entries ?? []).filter((p) => p.status === "AKTIF");
  const todayRecords = (absensiData?.content?.entries ?? []).filter(
    (a) => tanggalIsoDate(a.tanggal) === todayIsoDate()
  );
  const markedIds = new Set(todayRecords.map((a) => a.pesertaMagangId));
  const belumAbsen = pesertaAktif.filter((p) => !markedIds.has(p.id));
  const hadirCount = todayRecords.filter((a) => a.kehadiran === "Hadir").length;
  const totalAktif = pesertaAktif.length;
  const pctHadir = totalAktif > 0 ? Math.round((hadirCount / totalAktif) * 100) : 0;
  const allDone = !isLoading && totalAktif > 0 && belumAbsen.length === 0;

  return (
    <Card className="h-full overflow-hidden border-[#E2E8EA] shadow-[0_1px_2px_rgba(15,76,92,0.04)]">
      <CardHeader className="gap-3 border-b border-[#EEF2F3] pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#0F4C5C]/70 uppercase">
              Kehadiran
            </p>
            <h2 className="font-display text-lg font-semibold tracking-tight text-[#1C2A30]">
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
      </CardHeader>

      <CardContent className="pt-5">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl bg-[#F4F8F9] px-4 py-3.5">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-4xl font-semibold tracking-tight tabular-nums text-[#0F4C5C]">
                    {hadirCount}
                    <span className="ml-1 text-lg font-medium text-[#7A8790]">/{totalAktif}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-[#5C6B72]">peserta aktif sudah hadir</p>
                </div>
                <p className="shrink-0 font-display text-2xl font-semibold tabular-nums text-[#0F4C5C]">
                  {totalAktif > 0 ? `${pctHadir}%` : "—"}
                </p>
              </div>
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-[#E2EBEA]"
                role="progressbar"
                aria-valuenow={pctHadir}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Persentase kehadiran hari ini"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-500",
                    allDone ? "bg-[#1B6B4A]" : "bg-[#0F4C5C]"
                  )}
                  style={{ width: `${totalAktif > 0 ? pctHadir : 0}%` }}
                />
              </div>
            </div>

            {belumAbsen.length > 0 ? (
              <div>
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold tracking-[0.12em] text-[#7A8790] uppercase">
                    Belum absen
                  </p>
                  <span className="rounded-md bg-[#FFF6DB] px-2 py-0.5 text-xs font-semibold text-[#8A6A12]">
                    {belumAbsen.length} orang
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {belumAbsen.slice(0, 6).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 rounded-full border border-[#E2E8EA] bg-white py-1 pr-3 pl-1 text-sm text-[#1C2A30]"
                    >
                      <span className="flex size-6 items-center justify-center rounded-full bg-[#0F4C5C]/10 text-[10px] font-semibold text-[#0F4C5C]">
                        {initials(p.name)}
                      </span>
                      <span className="max-w-[9rem] truncate">{p.name}</span>
                    </div>
                  ))}
                  {belumAbsen.length > 6 && (
                    <span className="self-center text-sm text-[#5C6B72]">
                      +{belumAbsen.length - 6} lainnya
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-[#D7EADF] bg-[#E8F3EE] px-3.5 py-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#1B6B4A]/15 text-[#1B6B4A]">
                  <Icon icon="mdi:check" className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1B6B4A]">Lengkap untuk hari ini</p>
                  <p className="mt-0.5 text-xs text-[#3D6B56]">
                    {totalAktif > 0
                      ? "Semua peserta aktif sudah tercatat."
                      : "Belum ada peserta aktif."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
