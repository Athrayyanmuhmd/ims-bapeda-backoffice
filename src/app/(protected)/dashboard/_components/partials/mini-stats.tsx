"use client";

import { DateTime } from "luxon";
import { MiniStatCard } from "@/components/mini-stat-card";
import { useDashboardData } from "../use-dashboard-data";

export default function MiniStats() {
  // ponytail: fetches the latest 100 absensi records and filters client-side
  // for "this month". Fine at this scale; move server-side if it grows.
  const { pesertaData, absensiData, isLoading } = useDashboardData();

  const peserta = pesertaData?.content?.entries ?? [];
  const totalPeserta = pesertaData?.content?.totalData ?? 0;
  const totalAktif = peserta.filter((p) => p.status === "AKTIF").length;

  const now = DateTime.now();
  const monthRecords = (absensiData?.content?.entries ?? []).filter((a) => {
    const d = DateTime.fromISO(a.tanggal);
    return d.hasSame(now, "month") && d.hasSame(now, "year");
  });
  const rataKehadiran =
    monthRecords.length > 0
      ? Math.round((monthRecords.filter((a) => a.kehadiran === "Hadir").length / monthRecords.length) * 100)
      : 0;

  const segeraSelesai = peserta.filter((p) => {
    if (p.status !== "AKTIF" || !p.tanggalSelesai) return false;
    const daysLeft = DateTime.fromISO(p.tanggalSelesai).diff(now, "days").days;
    return daysLeft >= 0 && daysLeft <= 30;
  }).length;

  return (
    <div className="grid grid-cols-2 gap-4">
      <MiniStatCard icon="mdi:account-group-outline" label="Total Peserta" value={totalPeserta} loading={isLoading} />
      <MiniStatCard
        icon="mdi:check-decagram-outline"
        label="Peserta Aktif"
        value={totalAktif}
        accent="green"
        loading={isLoading}
      />
      <MiniStatCard
        icon="mdi:chart-line"
        label="Kehadiran Bulan Ini"
        value={`${rataKehadiran}%`}
        accent="primary"
        loading={isLoading}
      />
      <MiniStatCard
        icon="mdi:calendar-clock-outline"
        label="Segera Selesai"
        value={segeraSelesai}
        accent="orange"
        loading={isLoading}
      />
    </div>
  );
}
