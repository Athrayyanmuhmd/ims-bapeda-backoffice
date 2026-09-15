"use client";

import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { services } from "@/services";
import type { TPortalLogbook, TPortalPeserta } from "@/services/portal/types";
import { cn } from "@/utils/classname";
import { fmtJam, fmtTanggal, fmtTanggalLong, todayIsoDate } from "@/utils/datetime";
import EditProfileDialog from "./edit-profile-dialog";
import IzinDialog from "./izin-dialog";
import LogbookForm from "./logbook-form";

const portalKeys = {
  today: ["portal", "absensi", "today"] as const,
  window: ["portal", "absensi", "window"] as const,
  absensi: ["portal", "absensi"] as const,
  logbook: ["portal", "logbook"] as const,
  penilaian: ["portal", "penilaian"] as const,
  dokumen: ["portal", "dokumen"] as const,
};

const STATUS_TONE: Record<string, string> = {
  Hadir: "bg-[#E8F3EE] text-[#1B6B4A]",
  Sakit: "bg-[#FFF1E6] text-[#B85C1A]",
  Izin: "bg-[#E8EEF8] text-[#2F4F8A]",
  Alpa: "bg-[#FCEAEA] text-[#A33B3B]",
  PENDING: "bg-[#FFF6DB] text-[#8A6A12]",
};

function Section({
  eyebrow,
  title,
  children,
  action,
  className,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-xl border border-[#E2E8EA] bg-white p-4 shadow-[0_1px_2px_rgba(15,76,92,0.04)] sm:p-5",
        className
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#0F4C5C]/70 uppercase">
            {eyebrow}
          </p>
          <h2 className="font-display text-lg font-semibold tracking-tight text-[#1C2A30]">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusChip({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-[4.5rem] items-center justify-center rounded-md px-2.5 text-xs font-semibold whitespace-nowrap",
        tone
      )}
    >
      {label}
    </span>
  );
}

function TimeBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-lg border border-[#E8EEF0] bg-[#F7FAFB] px-3 py-3 sm:px-4">
      <p className="text-[11px] font-medium tracking-wide text-[#5C6B72] uppercase">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular-nums tracking-tight text-[#0F4C5C] sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

export default function Container({ peserta }: { peserta: TPortalPeserta }) {
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [izinOpen, setIzinOpen] = useState(false);
  const [editingLogbook, setEditingLogbook] = useState<TPortalLogbook | null>(null);

  const { data: todayRes, isLoading: isLoadingToday } = useQuery({
    queryKey: portalKeys.today,
    queryFn: () => services.portal.getTodayAbsensi(),
  });

  const { data: windowRes } = useQuery({
    queryKey: portalKeys.window,
    queryFn: () => services.portal.getCheckInWindow(),
    refetchInterval: 60_000,
  });

  const { data: profileRes } = useQuery({
    queryKey: ["portal", "me"] as const,
    queryFn: () => services.portal.getProfile(),
  });

  const { data: absensiRes } = useQuery({
    queryKey: portalKeys.absensi,
    queryFn: () => services.portal.getAbsensi(),
  });

  const { data: logbookRes } = useQuery({
    queryKey: portalKeys.logbook,
    queryFn: () => services.portal.getLogbook(),
  });

  const { data: penilaianRes } = useQuery({
    queryKey: portalKeys.penilaian,
    queryFn: () => services.portal.getPenilaian(),
  });

  const { data: dokumenRes } = useQuery({
    queryKey: portalKeys.dokumen,
    queryFn: () => services.portal.getDokumen(),
  });

  const today = todayRes?.content ?? null;
  const checkInWindow = windowRes?.content ?? null;
  const profile = profileRes?.content ?? peserta;
  const absensi = absensiRes?.content ?? [];
  const logbook = logbookRes?.content ?? [];
  const penilaian = penilaianRes?.content ?? [];
  const dokumen = dokumenRes?.content ?? [];

  const invalidateAbsensi = () => {
    queryClient.invalidateQueries({ queryKey: portalKeys.today });
    queryClient.invalidateQueries({ queryKey: portalKeys.absensi });
    queryClient.invalidateQueries({ queryKey: portalKeys.window });
  };

  const checkInMutation = useMutation({
    mutationFn: () => services.portal.checkIn(),
    onSuccess: (res) => {
      toast.success(res.message);
      invalidateAbsensi();
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const checkOutMutation = useMutation({
    mutationFn: () => services.portal.checkOut(),
    onSuccess: (res) => {
      toast.success(res.message);
      invalidateAbsensi();
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const onLogout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/portal-logout", { method: "GET" });
    window.location.href = "/login";
  };

  const isBusy = checkInMutation.isPending || checkOutMutation.isPending;
  const hasCheckedIn = !!today?.jamMasuk;
  const hasCheckedOut = !!today?.jamKeluar;
  const isPendingIzin = today?.izinStatus === "PENDING";
  const isRejectedIzin = today?.izinStatus === "REJECTED";
  const hasFinalIzin =
    !isPendingIzin &&
    !isRejectedIzin &&
    (today?.kehadiran === "Izin" || today?.kehadiran === "Sakit" || today?.kehadiran === "Alpa");
  const canCheckIn =
    !hasCheckedIn && !hasFinalIzin && !isPendingIzin && (checkInWindow?.isOpen ?? true);
  const canCheckOut = hasCheckedIn && !hasCheckedOut && !hasFinalIzin && !isPendingIzin;
  const canAjukanIzin = !hasCheckedIn && !hasFinalIzin && !isPendingIzin;

  const totalKerja = profile.totalHariKerja ?? 0;
  const sisaKerja = profile.sisaHariKerja ?? 0;
  const selesaiKerja =
    totalKerja > 0 ? Math.min(totalKerja, Math.max(0, totalKerja - sisaKerja)) : 0;
  const progressKerja = totalKerja > 0 ? Math.round((selesaiKerja / totalKerja) * 100) : 0;

  const formatJamRange = (masuk: string | null | undefined, keluar: string | null | undefined) => {
    if (!masuk && !keluar) return "—";
    if (masuk && !keluar) return `${fmtJam(masuk)} · belum keluar`;
    if (!masuk && keluar) return `… – ${fmtJam(keluar)}`;
    return `${fmtJam(masuk)} – ${fmtJam(keluar)}`;
  };

  const todayStatusLabel = isPendingIzin
    ? `Menunggu ${today?.izinJenis ?? today?.kehadiran}`
    : today?.kehadiran
      ? `${today.kehadiran}${today.izinStatus === "REJECTED" ? " · ditolak" : ""}`
      : "Belum absen";

  const todayStatusTone = isPendingIzin
    ? STATUS_TONE.PENDING
    : today?.kehadiran
      ? (STATUS_TONE[today.kehadiran] ?? "bg-[#F3F0EA] text-[#5C6B72]")
      : "bg-[#EEF2F3] text-[#5C6B72]";

  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const metaLine = [profile.divisi, profile.instansi, profile.nim ? `NIM ${profile.nim}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      {/* Enterprise top bar */}
      <header className="sticky top-0 z-30 border-b border-[#D7E2E5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-6">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-[#0F4C5C]/70 uppercase sm:text-[11px]">
                SIMAGANG
              </p>
              <p className="font-display truncate text-sm font-semibold text-[#0F4C5C] sm:text-base">
                Portal Peserta
              </p>
            </div>
            <nav className="hidden items-center gap-1 border-l border-[#E2E8EA] pl-4 md:flex lg:pl-6">
              <Link
                href="/portal"
                className="rounded-md bg-[#0F4C5C]/08 px-3 py-1.5 text-sm font-medium text-[#0F4C5C]"
              >
                Beranda
              </Link>
              <Link
                href="/portal/kehadiran"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-[#5C6B72] transition-colors hover:bg-[#F0F4F5] hover:text-[#0F4C5C]"
              >
                Kehadiran
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden min-w-0 text-right lg:block">
              <p className="truncate text-sm font-medium text-[#1C2A30]">{profile.name}</p>
              <p className="truncate text-xs text-[#5C6B72]">
                {profile.pembimbingLapangan
                  ? `Pembimbing: ${profile.pembimbingLapangan}`
                  : "Peserta magang"}
              </p>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0F4C5C] text-xs font-semibold text-white sm:size-10 sm:text-sm">
              {initials}
            </div>
            <div className="flex items-center gap-0.5 border-l border-[#E2E8EA] pl-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-[#5C6B72] hover:bg-[#F0F4F5] hover:text-[#0F4C5C]"
                onClick={() => setEditProfileOpen(true)}
                aria-label="Edit profil"
              >
                <Icon icon="mdi:account-edit-outline" className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-[#5C6B72] hover:bg-[#F0F4F5] hover:text-[#0F4C5C]"
                onClick={onLogout}
                disabled={isLoggingOut}
                aria-label="Keluar"
              >
                <Icon icon="mdi:logout" className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-5 pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8 sm:pb-10 lg:px-8">
        {/* Page heading */}
        <div className="mb-5 flex flex-col gap-1 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[#1C2A30] sm:text-3xl">
              Halo, {profile.name.split(" ")[0]}
            </h1>
            <p className="mt-1 truncate text-sm text-[#5C6B72]">{metaLine || "—"}</p>
          </div>
          <Link
            href="/portal/kehadiran"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#0F4C5C] hover:underline md:hidden"
          >
            Lihat kalender kehadiran
            <Icon icon="mdi:chevron-right" className="size-4" />
          </Link>
        </div>

        {/* Summary strip */}
        <div className="mb-4 grid gap-3 sm:mb-5 sm:grid-cols-3">
          <div className="rounded-xl border border-[#E2E8EA] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,76,92,0.04)]">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#7A8790] uppercase">
              Status hari ini
            </p>
            <div className="mt-2">
              <StatusChip label={todayStatusLabel} tone={todayStatusTone} />
            </div>
          </div>
          <div className="rounded-xl border border-[#E2E8EA] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,76,92,0.04)]">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#7A8790] uppercase">
              Sisa hari kerja
            </p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-[#0F4C5C]">
              {profile.sisaHariKerja ?? "—"}
              <span className="ml-1 text-sm font-normal text-[#5C6B72]">hari</span>
            </p>
          </div>
          <div className="rounded-xl border border-[#E2E8EA] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,76,92,0.04)]">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#7A8790] uppercase">
              Progress magang
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#E7EFEC]">
                <div
                  className="h-full rounded-full bg-[#0F4C5C] transition-[width] duration-500"
                  style={{ width: `${progressKerja}%` }}
                />
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-[#0F4C5C]">
                {totalKerja > 0 ? `${progressKerja}%` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Primary workspace: equal-height columns only from lg up.
            On mobile, h-full/flex-1 constrained the Logbook card and let
            "Entri terakhir" paint over the aside (Masa magang / Kehadiran). */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch lg:gap-5">
          {/* Left / main */}
          <div className="flex min-h-0 flex-col gap-4 lg:col-span-7 lg:h-full xl:col-span-8">
            <Section
              eyebrow="Hari ini"
              title={fmtTanggalLong(`${todayIsoDate()}T00:00:00.000Z`)}
              action={<StatusChip label={todayStatusLabel} tone={todayStatusTone} />}
              className="shrink-0"
            >
              {isLoadingToday ? (
                <Skeleton className="h-28 w-full rounded-xl" />
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <TimeBlock label="Masuk" value={fmtJam(today?.jamMasuk)} />
                    <TimeBlock label="Keluar" value={fmtJam(today?.jamKeluar)} />
                  </div>

                  <div className="hidden gap-2 sm:grid sm:grid-cols-3">
                    <Button
                      className="bg-[#0F4C5C] hover:bg-[#0C3D4A]"
                      onClick={() => checkInMutation.mutate()}
                      disabled={isBusy || !canCheckIn}
                      isLoading={checkInMutation.isPending}
                    >
                      <Icon icon="mdi:login" /> Check-in
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#CFD8DB]"
                      onClick={() => checkOutMutation.mutate()}
                      disabled={isBusy || !canCheckOut}
                      isLoading={checkOutMutation.isPending}
                    >
                      <Icon icon="mdi:logout-variant" /> Check-out
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#CFD8DB]"
                      onClick={() => setIzinOpen(true)}
                      disabled={isBusy || !canAjukanIzin}
                    >
                      <Icon icon="mdi:calendar-remove-outline" /> Izin / Sakit
                    </Button>
                  </div>

                  {!hasCheckedIn &&
                    !hasFinalIzin &&
                    !isPendingIzin &&
                    checkInWindow &&
                    !checkInWindow.isOpen && (
                      <p className="rounded-lg bg-[#EEF2F3] px-3 py-2 text-xs text-[#5C6B72]">
                        Check-in dibuka pukul{" "}
                        <span className="font-semibold text-[#0F4C5C]">
                          {checkInWindow.label}
                        </span>
                        . Di luar jam tersebut tombol Check-in nonaktif — gunakan Izin / Sakit jika
                        berhalangan hadir.
                      </p>
                    )}

                  {isPendingIzin && (
                    <p className="rounded-lg bg-[#FFF6DB] px-3 py-2 text-xs text-[#8A6A12]">
                      Pengajuan izin menunggu persetujuan pembimbing.
                    </p>
                  )}

                  {today?.keterangan && (
                    <p className="text-xs text-[#5C6B72]">Keterangan: {today.keterangan}</p>
                  )}
                </div>
              )}
            </Section>

            <Section
              eyebrow="Kegiatan"
              title="Logbook"
              className="scroll-mt-24 flex flex-col lg:min-h-0 lg:flex-1"
            >
              <div id="logbook-form" className="shrink-0">
                <LogbookForm
                  embedded
                  editing={editingLogbook}
                  onCancelEdit={() => setEditingLogbook(null)}
                  onSaved={() => {
                    setEditingLogbook(null);
                    queryClient.invalidateQueries({ queryKey: portalKeys.logbook });
                  }}
                />
              </div>

              <div className="mt-5 flex flex-col border-t border-[#EDE8E0] pt-4 lg:min-h-0 lg:flex-1">
                <p className="mb-3 shrink-0 text-[11px] font-semibold tracking-[0.12em] text-[#7A8790] uppercase">
                  Entri terakhir
                </p>
                {logbook.length === 0 ? (
                  <p className="text-sm text-[#5C6B72]">Belum ada catatan kegiatan.</p>
                ) : (
                  <ul className="flex flex-1 flex-col gap-2">
                    {logbook.slice(0, 6).map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-start justify-between gap-3 rounded-lg border border-[#EEF2F3] bg-[#F7FAFB] px-3 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#0F4C5C]">
                            {fmtTanggal(entry.tanggal)}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-[#1C2A30]">
                            {entry.kegiatan}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-[#0F4C5C]"
                          onClick={() => {
                            setEditingLogbook(entry);
                            document
                              .getElementById("logbook-form")
                              ?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                        >
                          Edit
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Section>
          </div>

          {/* Right rail */}
          <aside className="flex min-h-0 flex-col gap-4 lg:col-span-5 lg:h-full xl:col-span-4">
            {(profile.sisaHariKerja != null || profile.tanggalSelesai) && (
              <Section eyebrow="Periode" title="Masa magang" className="shrink-0">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#5C6B72]">
                      Berakhir {fmtTanggalLong(profile.tanggalSelesai)}
                    </p>
                    {profile.pembimbingLapangan && (
                      <p className="mt-1 text-sm text-[#1C2A30]">
                        Pembimbing:{" "}
                        <span className="font-medium">{profile.pembimbingLapangan}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl font-semibold tabular-nums text-[#0F4C5C]">
                      {profile.sisaHariKerja ?? "—"}
                    </p>
                    <p className="text-xs text-[#5C6B72]">hari kerja tersisa</p>
                  </div>
                </div>

                {totalKerja > 0 && (
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs text-[#5C6B72]">
                      <span>
                        {selesaiKerja} dari {totalKerja} hari kerja
                      </span>
                      <span className="tabular-nums font-medium text-[#0F4C5C]">
                        {progressKerja}%
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-[#E7EFEC]"
                      role="progressbar"
                      aria-valuenow={progressKerja}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-[#0F4C5C] transition-[width] duration-500"
                        style={{ width: `${progressKerja}%` }}
                      />
                    </div>
                  </div>
                )}
              </Section>
            )}

            <Section
              eyebrow="Riwayat"
              title="Kehadiran"
              className="lg:min-h-0 lg:flex-1 lg:overflow-hidden"
              action={
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-[#CFD8DB] text-[#0F4C5C]"
                >
                  <Link href="/portal/kehadiran">Kalender</Link>
                </Button>
              }
            >
              {absensi.length === 0 ? (
                <p className="text-sm text-[#5C6B72]">Belum ada catatan kehadiran.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[18rem] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#EDE8E0] text-[10px] font-semibold tracking-[0.12em] text-[#7A8790] uppercase">
                        <th className="pb-2 pr-2 font-semibold">Tanggal</th>
                        <th className="pb-2 pr-2 font-semibold">Jam</th>
                        <th className="pb-2 text-right font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {absensi.slice(0, 6).map((row) => {
                        const pending = row.izinStatus === "PENDING";
                        const label = pending
                          ? `Menunggu ${row.izinJenis ?? row.kehadiran}`
                          : row.kehadiran;
                        const tone = pending
                          ? STATUS_TONE.PENDING
                          : (STATUS_TONE[row.kehadiran] ?? "bg-[#EEF2F3] text-[#5C6B72]");

                        return (
                          <tr key={row.id} className="border-b border-[#F0F3F4] last:border-0">
                            <td className="py-2.5 pr-2 tabular-nums text-[#1C2A30]">
                              {fmtTanggal(row.tanggal)}
                            </td>
                            <td className="max-w-[7rem] truncate py-2.5 pr-2 text-xs tabular-nums text-[#5C6B72] sm:max-w-none">
                              {formatJamRange(row.jamMasuk, row.jamKeluar)}
                            </td>
                            <td className="py-2.5 text-right">
                              <StatusChip label={label} tone={tone} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <div className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Section eyebrow="Hasil" title="Penilaian">
                {penilaian.length === 0 ? (
                  <p className="text-sm text-[#5C6B72]">Belum ada penilaian.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {penilaian.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-lg border border-[#EEF2F3] bg-[#F7FAFB] px-3 py-3"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-display text-2xl font-semibold tabular-nums text-[#0F4C5C]">
                            {item.nilai}
                          </p>
                          <p className="text-xs text-[#5C6B72]">oleh {item.penilai}</p>
                        </div>
                        {item.komentar && (
                          <p className="mt-1 text-sm text-[#1C2A30]">{item.komentar}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section eyebrow="Berkas" title="Dokumen">
                {dokumen.length === 0 ? (
                  <p className="text-sm text-[#5C6B72]">Belum ada dokumen.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {dokumen.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-[#EEF2F3] bg-[#F7FAFB] px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#1C2A30]">
                            {doc.namaFile}
                          </p>
                          <p className="text-[11px] text-[#5C6B72]">
                            {doc.jenisDokumen.replaceAll("_", " ")} · {fmtTanggal(doc.createdAt)}
                          </p>
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="shrink-0 border-[#CFD8DB]"
                        >
                          <a href={doc.urlFile} target="_blank" rel="noreferrer">
                            Buka
                          </a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile action dock */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#D7E2E5] bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
        {!hasCheckedIn &&
          !hasFinalIzin &&
          !isPendingIzin &&
          checkInWindow &&
          !checkInWindow.isOpen && (
            <p className="mx-auto mb-2 max-w-lg text-center text-[11px] text-[#5C6B72]">
              Check-in dibuka {checkInWindow.label}
            </p>
          )}
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
          <Button
            className="bg-[#0F4C5C] hover:bg-[#0C3D4A]"
            onClick={() => checkInMutation.mutate()}
            disabled={isBusy || !canCheckIn}
            isLoading={checkInMutation.isPending}
          >
            Check-in
          </Button>
          <Button
            variant="outline"
            className="border-[#CFD8DB]"
            onClick={() => checkOutMutation.mutate()}
            disabled={isBusy || !canCheckOut}
            isLoading={checkOutMutation.isPending}
          >
            Check-out
          </Button>
          <Button
            variant="outline"
            className="border-[#CFD8DB]"
            onClick={() => setIzinOpen(true)}
            disabled={isBusy || !canAjukanIzin}
          >
            Izin
          </Button>
        </div>
      </div>

      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        profile={profile}
      />
      <IzinDialog open={izinOpen} onOpenChange={setIzinOpen} onSaved={invalidateAbsensi} />
    </div>
  );
}
