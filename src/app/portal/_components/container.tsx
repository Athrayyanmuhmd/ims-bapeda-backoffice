"use client";

import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { services } from "@/services";
import type { TPortalJurnal, TPortalPeserta } from "@/services/portal/types";
import { cn } from "@/utils/classname";
import { fmtJam, fmtTanggal, fmtTanggalLong, todayIsoDate } from "@/utils/datetime";
import { KEHADIRAN_BADGE_CLASS } from "@/utils/status-badge";
import ChangePasswordDialog from "./change-password-dialog";
import JurnalForm from "./jurnal-form";

const portalKeys = {
  today: ["portal", "absensi", "today"] as const,
  absensi: ["portal", "absensi"] as const,
  jurnal: ["portal", "jurnal"] as const,
  penilaian: ["portal", "penilaian"] as const,
  dokumen: ["portal", "dokumen"] as const,
};

function Section({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon icon={icon} className="size-4 shrink-0" />
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function Container({ peserta }: { peserta: TPortalPeserta }) {
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [editingJurnal, setEditingJurnal] = useState<TPortalJurnal | null>(null);

  const { data: todayRes, isLoading: isLoadingToday } = useQuery({
    queryKey: portalKeys.today,
    queryFn: () => services.portal.getTodayAbsensi(),
  });

  const { data: profileRes } = useQuery({
    queryKey: ["portal", "me"] as const,
    queryFn: () => services.portal.getProfile(),
  });

  const { data: absensiRes } = useQuery({
    queryKey: portalKeys.absensi,
    queryFn: () => services.portal.getAbsensi(),
  });

  const { data: jurnalRes } = useQuery({
    queryKey: portalKeys.jurnal,
    queryFn: () => services.portal.getJurnal(),
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
  const profile = profileRes?.content ?? peserta;
  const absensi = absensiRes?.content ?? [];
  const jurnal = jurnalRes?.content ?? [];
  const penilaian = penilaianRes?.content ?? [];
  const dokumen = dokumenRes?.content ?? [];

  const invalidateAbsensi = () => {
    queryClient.invalidateQueries({ queryKey: portalKeys.today });
    queryClient.invalidateQueries({ queryKey: portalKeys.absensi });
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
    window.location.href = "/portal/login";
  };

  const isBusy = checkInMutation.isPending || checkOutMutation.isPending;
  const hasCheckedIn = !!today?.jamMasuk;
  const hasCheckedOut = !!today?.jamKeluar;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 bg-[#FAFAFA] p-4 pb-24 sm:pb-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm">Portal Peserta Magang</p>
          <h1 className="font-display truncate text-xl font-semibold tracking-tight">
            {profile.name}
          </h1>
          <p className="text-muted-foreground text-xs">
            {profile.divisi ?? "-"} · Pembimbing: {profile.pembimbingLapangan ?? "-"}
          </p>
          {(profile.instansi || profile.nim) && (
            <p className="text-muted-foreground mt-0.5 text-xs">
              {[profile.instansi, profile.nim ? `NIM ${profile.nim}` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setChangePasswordOpen(true)}>
            <Icon icon="mdi:lock-reset" />
            <span className="hidden sm:inline">Ganti Password</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onLogout} disabled={isLoggingOut}>
            <Icon icon="mdi:logout" /> Keluar
          </Button>
        </div>
      </header>

      {(profile.sisaHariKerja != null || profile.tanggalSelesai) && (
        <Card className="border-emerald-200/80 bg-emerald-50/50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <div>
              <p className="text-sm font-medium text-emerald-900">Sisa masa magang</p>
              <p className="text-muted-foreground text-xs">
                Sampai {fmtTanggalLong(profile.tanggalSelesai)} · Sabtu/Minggu & hari
                libur nasional tidak dihitung di hari kerja
              </p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-semibold tabular-nums text-emerald-800">
                  {profile.sisaHariKerja ?? "—"}
                </p>
                <p className="text-muted-foreground text-xs">hari kerja</p>
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums text-emerald-800/80">
                  {profile.sisaHariKalender ?? "—"}
                </p>
                <p className="text-muted-foreground text-xs">hari kalender</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Section title="Kehadiran Hari Ini" icon="mdi:clock-edit-outline">
        {isLoadingToday ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground text-sm">
              {fmtTanggalLong(`${todayIsoDate()}T00:00:00.000Z`)}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1 text-sm">
                <p>
                  Jam masuk: <span className="font-semibold">{fmtJam(today?.jamMasuk)}</span>
                </p>
                <p>
                  Jam keluar: <span className="font-semibold">{fmtJam(today?.jamKeluar)}</span>
                </p>
              </div>

              {today?.kehadiran && (
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    KEHADIRAN_BADGE_CLASS[today.kehadiran] ?? "bg-accent text-muted-foreground"
                  )}
                >
                  {today.kehadiran}
                </span>
              )}
            </div>

            <div className="hidden flex-wrap gap-2 sm:flex">
              <Button
                onClick={() => checkInMutation.mutate()}
                disabled={isBusy || hasCheckedIn}
                isLoading={checkInMutation.isPending}
              >
                <Icon icon="mdi:login" /> Check-in
              </Button>
              <Button
                variant="outline"
                onClick={() => checkOutMutation.mutate()}
                disabled={isBusy || !hasCheckedIn || hasCheckedOut}
                isLoading={checkOutMutation.isPending}
              >
                <Icon icon="mdi:logout-variant" /> Check-out
              </Button>
            </div>

            <p className="text-muted-foreground text-xs">
              Check-in hanya untuk hari ini. Koreksi tanggal lain: hubungi pembimbing lapangan.
            </p>
          </div>
        )}
      </Section>

      <JurnalForm
        editing={editingJurnal}
        onCancelEdit={() => setEditingJurnal(null)}
        onSaved={() => {
          setEditingJurnal(null);
          queryClient.invalidateQueries({ queryKey: portalKeys.jurnal });
        }}
      />

      <Section title="Jurnal Terakhir" icon="mdi:notebook-outline">
        {jurnal.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada jurnal kegiatan.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {jurnal.slice(0, 10).map((j) => (
              <li
                key={j.id}
                className="flex flex-col gap-2 border-b border-border/60 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 text-sm">
                  <p className="text-muted-foreground text-xs">{fmtTanggal(j.tanggal)}</p>
                  <p className="wrap-break-word whitespace-pre-wrap">{j.kegiatan}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit shrink-0"
                  onClick={() => {
                    setEditingJurnal(j);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <Icon icon="mdi:pencil-outline" /> Edit
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Riwayat Kehadiran" icon="mdi:calendar-check-outline">
        {absensi.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada catatan kehadiran.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {absensi.slice(0, 15).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground shrink-0">{fmtTanggal(a.tanggal)}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {fmtJam(a.jamMasuk)} – {fmtJam(a.jamKeluar)}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    KEHADIRAN_BADGE_CLASS[a.kehadiran] ?? "bg-accent text-muted-foreground"
                  )}
                >
                  {a.kehadiran}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Penilaian" icon="mdi:star-outline">
        {penilaian.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada penilaian.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {penilaian.map((p) => (
              <li key={p.id} className="text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Nilai: {p.nilai}</span>
                  <span className="text-muted-foreground text-xs">oleh {p.penilai}</span>
                </div>
                {p.komentar && <p className="text-muted-foreground mt-0.5">{p.komentar}</p>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Dokumen" icon="mdi:file-document-outline">
        {dokumen.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada dokumen.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {dokumen.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{d.namaFile}</p>
                  <p className="text-muted-foreground text-xs">
                    {d.jenisDokumen.replaceAll("_", " ")} · {fmtTanggal(d.createdAt)}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <a href={d.urlFile} target="_blank" rel="noreferrer">
                    <Icon icon="mdi:open-in-new" /> Buka
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Sticky mobile check-in bar — primary daily action stays one thumb away. */}
      <div className="border-border/80 bg-background/95 fixed inset-x-0 bottom-0 z-20 border-t p-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Button
            className="flex-1"
            onClick={() => checkInMutation.mutate()}
            disabled={isBusy || hasCheckedIn}
            isLoading={checkInMutation.isPending}
          >
            <Icon icon="mdi:login" /> Check-in
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => checkOutMutation.mutate()}
            disabled={isBusy || !hasCheckedIn || hasCheckedOut}
            isLoading={checkOutMutation.isPending}
          >
            <Icon icon="mdi:logout-variant" /> Check-out
          </Button>
        </div>
      </div>

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </main>
  );
}
