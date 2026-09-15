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
import ChangePasswordDialog from "./change-password-dialog";
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
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#E4E0D8] bg-[#FFFEFB] p-4 shadow-[0_1px_0_rgba(15,76,92,0.04)] sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
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

function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-[4.5rem] items-center justify-center rounded-md px-2.5 text-xs font-semibold",
        tone
      )}
    >
      {label}
    </span>
  );
}

function TimeBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-xl bg-[#F3F0EA] px-3 py-3">
      <p className="text-[11px] font-medium tracking-wide text-[#5C6B72] uppercase">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums tracking-tight text-[#0F4C5C]">
        {value}
      </p>
    </div>
  );
}

export default function Container({ peserta }: { peserta: TPortalPeserta }) {
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
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
      : "bg-[#F3F0EA] text-[#5C6B72]";

  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#E7F0F2_0%,_#F7F4EF_45%,_#F3EFE7_100%)]">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-5 pb-28 sm:gap-5 sm:pt-8 sm:pb-10">
        {/* Identity bar */}
        <header className="rounded-2xl border border-[#D7E4E7] bg-[#0F4C5C] p-4 text-[#F4FBFC] shadow-[0_12px_40px_-24px_rgba(15,76,92,0.7)] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 font-display text-sm font-semibold tracking-wide">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
                  Portal Peserta
                </p>
                <h1 className="font-display truncate text-xl font-semibold tracking-tight sm:text-2xl">
                  {profile.name}
                </h1>
                <p className="mt-1 truncate text-sm text-white/75">
                  {[profile.divisi, profile.pembimbingLapangan ? `Pembimbing ${profile.pembimbingLapangan}` : null]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
                {(profile.instansi || profile.nim) && (
                  <p className="mt-0.5 truncate text-xs text-white/60">
                    {[profile.instansi, profile.nim ? `NIM ${profile.nim}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-white hover:bg-white/10 hover:text-white"
                onClick={() => setChangePasswordOpen(true)}
                aria-label="Ganti password"
              >
                <Icon icon="mdi:lock-reset" className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-white hover:bg-white/10 hover:text-white"
                onClick={onLogout}
                disabled={isLoggingOut}
                aria-label="Keluar"
              >
                <Icon icon="mdi:logout" className="size-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Progress */}
        {(profile.sisaHariKerja != null || profile.tanggalSelesai) && (
          <section className="rounded-2xl border border-[#E4E0D8] bg-[#FFFEFB] p-4 sm:p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[#0F4C5C]/70 uppercase">
                  Periode
                </p>
                <h2 className="font-display text-lg font-semibold text-[#1C2A30]">
                  Sisa masa magang
                </h2>
                <p className="mt-1 text-xs text-[#5C6B72]">
                  Berakhir {fmtTanggalLong(profile.tanggalSelesai)}
                </p>
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
                  <span className="tabular-nums font-medium text-[#0F4C5C]">{progressKerja}%</span>
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
          </section>
        )}

        {/* Today attendance — primary job */}
        <Section
          eyebrow="Hari ini"
          title={fmtTanggalLong(`${todayIsoDate()}T00:00:00.000Z`)}
          action={<StatusChip label={todayStatusLabel} tone={todayStatusTone} />}
        >
          {isLoadingToday ? (
            <Skeleton className="h-28 w-full rounded-xl" />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2.5">
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

              {isPendingIzin && (
                <p className="rounded-xl bg-[#FFF6DB] px-3 py-2 text-xs text-[#8A6A12]">
                  Pengajuan izin menunggu persetujuan pembimbing.
                </p>
              )}

              {today?.keterangan && (
                <p className="text-xs text-[#5C6B72]">Keterangan: {today.keterangan}</p>
              )}
            </div>
          )}
        </Section>

        {/* Logbook */}
        <Section eyebrow="Kegiatan" title="Logbook">
          <LogbookForm
            embedded
            editing={editingLogbook}
            onCancelEdit={() => setEditingLogbook(null)}
            onSaved={() => {
              setEditingLogbook(null);
              queryClient.invalidateQueries({ queryKey: portalKeys.logbook });
            }}
          />

          <div className="mt-5 border-t border-[#EDE8E0] pt-4">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-[#7A8790] uppercase">
              Entri terakhir
            </p>
            {logbook.length === 0 ? (
              <p className="text-sm text-[#5C6B72]">Belum ada catatan kegiatan.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {logbook.slice(0, 5).map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-3 rounded-xl bg-[#F7F4EF] px-3 py-3"
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
                        window.scrollTo({ top: 0, behavior: "smooth" });
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

        {/* Attendance history preview */}
        <Section
          eyebrow="Riwayat"
          title="Kehadiran"
          action={
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-[#CFD8DB] text-[#0F4C5C]"
            >
              <Link href="/portal/kehadiran">Lihat kehadiran</Link>
            </Button>
          }
        >
          {absensi.length === 0 ? (
            <p className="text-sm text-[#5C6B72]">Belum ada catatan kehadiran.</p>
          ) : (
            <ul className="flex flex-col">
              <li className="mb-2 grid grid-cols-[6.5rem_1fr_auto] gap-2 px-1 text-[10px] font-semibold tracking-[0.12em] text-[#7A8790] uppercase">
                <span>Tanggal</span>
                <span>Jam</span>
                <span className="text-right">Status</span>
              </li>
              {absensi.slice(0, 5).map((row) => {
                const pending = row.izinStatus === "PENDING";
                const label = pending
                  ? `Menunggu ${row.izinJenis ?? row.kehadiran}`
                  : row.kehadiran;
                const tone = pending
                  ? STATUS_TONE.PENDING
                  : (STATUS_TONE[row.kehadiran] ?? "bg-[#F3F0EA] text-[#5C6B72]");

                return (
                  <li
                    key={row.id}
                    className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-2 border-t border-[#EDE8E0] py-2.5 first:border-t-0"
                  >
                    <span className="text-sm tabular-nums text-[#1C2A30]">
                      {fmtTanggal(row.tanggal)}
                    </span>
                    <span className="truncate text-xs tabular-nums text-[#5C6B72]">
                      {formatJamRange(row.jamMasuk, row.jamKeluar)}
                    </span>
                    <StatusChip label={label} tone={tone} />
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Scores + docs */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Section eyebrow="Hasil" title="Penilaian">
            {penilaian.length === 0 ? (
              <p className="text-sm text-[#5C6B72]">Belum ada penilaian.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {penilaian.map((item) => (
                  <li key={item.id} className="rounded-xl bg-[#F7F4EF] px-3 py-3">
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
                    className="flex items-center justify-between gap-2 rounded-xl bg-[#F7F4EF] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#1C2A30]">{doc.namaFile}</p>
                      <p className="text-[11px] text-[#5C6B72]">
                        {doc.jenisDokumen.replaceAll("_", " ")} · {fmtTanggal(doc.createdAt)}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="shrink-0 border-[#CFD8DB]">
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
      </main>

      {/* Mobile action dock */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#D7E4E7] bg-[#FFFEFB]/95 p-3 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-2xl grid-cols-3 gap-2">
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

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
      <IzinDialog open={izinOpen} onOpenChange={setIzinOpen} onSaved={invalidateAbsensi} />
    </div>
  );
}
