"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { daysUntil, fmtTanggalLong } from "@/utils/datetime";
import { useDashboardData } from "../use-dashboard-data";

// Same 30-day window as the "Segera Selesai" counter in MiniStats — this is the
// actionable version of that number: who, when, and a way to open them.
const SOON_DAYS = 30;

const MAX_SHOWN = 5;

// A negative daysLeft means tanggalSelesai has passed while the status is still
// AKTIF — nobody closed the record out, which is worth surfacing louder than an
// upcoming end date.
const describe = (daysLeft: number) => {
  if (daysLeft < 0) return { label: `Lewat ${Math.abs(daysLeft)} hari`, overdue: true as const };
  if (daysLeft === 0) return { label: "Berakhir hari ini", overdue: false as const };
  return { label: `${daysLeft} hari lagi`, overdue: false as const };
};

export default function EndingSoon() {
  const { pesertaData, isLoading } = useDashboardData();

  const items = (pesertaData?.content?.entries ?? [])
    .flatMap((peserta) => {
      if (peserta.status !== "AKTIF" || !peserta.tanggalSelesai) return [];

      const daysLeft = daysUntil(peserta.tanggalSelesai);

      return daysLeft <= SOON_DAYS ? [{ ...peserta, daysLeft }] : [];
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <Card className="relative overflow-hidden border-[#E2E8EA] shadow-[0_1px_2px_rgba(15,76,92,0.04)] before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[#B85C1A] before:content-['']">
      <CardHeader className="pl-7">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon icon="mdi:calendar-clock-outline" className="size-4 text-[#B85C1A]" />
          Magang Segera Berakhir
        </CardTitle>
        <CardAction>
          <Link href="/peserta-magang" className="text-primary text-sm font-medium hover:underline">
            Lihat semua
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="pl-7">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Tidak ada magang yang berakhir dalam {SOON_DAYS} hari ke depan.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.slice(0, MAX_SHOWN).map((peserta) => {
              const { label, overdue } = describe(peserta.daysLeft);

              return (
                <li key={peserta.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <Link
                      href={`/peserta-magang/${peserta.id}`}
                      className="truncate font-medium hover:underline"
                    >
                      {peserta.name}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {fmtTanggalLong(peserta.tanggalSelesai)}
                      {peserta.divisi ? ` · ${peserta.divisi}` : ""}
                    </p>
                  </div>
                  <StatusBadge
                    label={label}
                    tone={overdue ? "danger" : "warning"}
                    className="min-w-[7.25rem]"
                  />
                </li>
              );
            })}

            {items.length > MAX_SHOWN && (
              <li className="text-muted-foreground text-xs">
                +{items.length - MAX_SHOWN} peserta lainnya
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
