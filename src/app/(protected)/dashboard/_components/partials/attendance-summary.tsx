"use client";

import Link from "next/link";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/classname";
import { tanggalIsoDate, todayIsoDate } from "@/utils/datetime";
import { useDashboardData } from "../use-dashboard-data";

export default function AttendanceSummary() {
  const today = todayIsoDate();

  const { pesertaData, absensiData, isLoading } = useDashboardData();

  const totalAktif = (pesertaData?.content?.entries ?? []).filter(
    (p) => p.status === "AKTIF"
  ).length;
  const todayRecords = (absensiData?.content?.entries ?? []).filter(
    (a) => tanggalIsoDate(a.tanggal) === today
  );

  const hadir = todayRecords.filter((a) => a.kehadiran === "Hadir").length;
  const sakitIzin = todayRecords.filter(
    (a) => a.kehadiran === "Sakit" || a.kehadiran === "Izin"
  ).length;
  const alpa = todayRecords.filter((a) => a.kehadiran === "Alpa").length;
  const belum = Math.max(totalAktif - todayRecords.length, 0);

  const pct = (n: number) => (totalAktif > 0 ? (n / totalAktif) * 100 : 0);

  const segments = [
    { value: hadir, className: "bg-green-600" },
    { value: sakitIzin, className: "bg-orange-500" },
    { value: alpa, className: "bg-red-600" },
    { value: belum, className: "bg-border" },
  ];

  return (
    <Card className="relative h-full overflow-hidden border-[#E2E8EA] shadow-[0_1px_2px_rgba(15,76,92,0.04)] before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[#175e86] before:content-['']">
      <CardHeader className="pl-7">
        <CardTitle>Ringkasan Kehadiran</CardTitle>
        <CardAction>
          <Link href="/absensi" className="text-primary text-sm font-medium hover:underline">
            Detail
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="pl-7">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#EEF2F3]">
              {segments.map((s, i) => (
                <div
                  key={i}
                  className={cn("h-full", s.className)}
                  style={{ width: `${pct(s.value)}%` }}
                />
              ))}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Aktif", value: totalAktif },
                { label: "Hadir", value: hadir },
                { label: "Sakit/Izin", value: sakitIzin },
                { label: "Alpa", value: alpa },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-[#F7FAFB] px-2 py-2">
                  <p className="font-display text-xl font-semibold tabular-nums">{s.value}</p>
                  <p className="text-muted-foreground text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
