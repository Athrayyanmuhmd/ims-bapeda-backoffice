"use client";

import { DateTime } from "luxon";
import Link from "next/link";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/classname";
import { useDashboardData } from "../use-dashboard-data";

export default function AttendanceSummary() {
  const today = DateTime.now().toISODate();

  const { pesertaData, absensiData, isLoading } = useDashboardData();

  const totalAktif = (pesertaData?.content?.entries ?? []).filter((p) => p.status === "AKTIF").length;
  const todayRecords = (absensiData?.content?.entries ?? []).filter(
    (a) => DateTime.fromISO(a.tanggal).toISODate() === today
  );

  const hadir = todayRecords.filter((a) => a.kehadiran === "Hadir").length;
  const sakitIzin = todayRecords.filter((a) => a.kehadiran === "Sakit" || a.kehadiran === "Izin").length;
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
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Kehadiran</CardTitle>
        <CardAction>
          <Link href="/absensi" className="text-primary text-sm font-medium hover:underline">
            Detail
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full">
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
                <div key={s.label}>
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
