"use client";

import { Icon } from "@iconify/react";
import { DateTime } from "luxon";
import Link from "next/link";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "../use-dashboard-data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export default function TodayHighlight() {
  const today = DateTime.now();

  const { pesertaData, absensiData, isLoading } = useDashboardData();

  const pesertaAktif = (pesertaData?.content?.entries ?? []).filter((p) => p.status === "AKTIF");
  const todayRecords = (absensiData?.content?.entries ?? []).filter(
    (a) => DateTime.fromISO(a.tanggal).toISODate() === today.toISODate()
  );
  const markedIds = new Set(todayRecords.map((a) => a.pesertaMagangId));
  const belumAbsen = pesertaAktif.filter((p) => !markedIds.has(p.id));
  const hadirCount = todayRecords.filter((a) => a.kehadiran === "Hadir").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Absensi Hari Ini</CardTitle>
        <CardAction>
          <Link href="/absensi" className="text-primary text-sm font-medium hover:underline">
            Buka absensi
          </Link>
        </CardAction>
        <p className="text-muted-foreground text-sm">{today.setLocale("id").toFormat("cccc, d LLLL yyyy")}</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-semibold tabular-nums">{hadirCount}</span>
              <span className="text-muted-foreground text-sm">
                dari {pesertaAktif.length} peserta aktif sudah tercatat hadir
              </span>
            </div>

            {belumAbsen.length > 0 ? (
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                  Belum absen ({belumAbsen.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {belumAbsen.slice(0, 6).map((p) => (
                    <div
                      key={p.id}
                      className="bg-accent flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm"
                    >
                      <span className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-full text-xs font-medium">
                        {initials(p.name)}
                      </span>
                      {p.name}
                    </div>
                  ))}
                  {belumAbsen.length > 6 && (
                    <span className="text-muted-foreground self-center text-sm">
                      +{belumAbsen.length - 6} lainnya
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Icon icon="mdi:check-circle-outline" className="text-green-600" />
                Semua peserta aktif sudah tercatat hari ini.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
