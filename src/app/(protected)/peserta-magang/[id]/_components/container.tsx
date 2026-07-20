"use client";

import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";
import { cn } from "@/utils/classname";
import { KEHADIRAN_BADGE_CLASS, STATUS_MAGANG_BADGE_CLASS } from "@/utils/status-badge";

const fmtDate = (iso: string | null) => (iso ? DateTime.fromISO(iso).toLocaleString(DateTime.DATE_MED) : "-");

function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", className)}>
      {label}
    </span>
  );
}

function Section({
  title,
  icon,
  emptyLabel,
  children,
}: {
  title: string;
  icon: string;
  emptyLabel: string;
  children: React.ReactNode | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon icon={icon} className="size-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children ?? <p className="text-muted-foreground text-sm">{emptyLabel}</p>}
      </CardContent>
    </Card>
  );
}

export default function Container({ id }: { id: string }) {
  const { data: pesertaRes, isLoading } = useQuery({
    queryKey: queryKeys.pesertaMagang.detail(id),
    queryFn: () => services.pesertaMagang.getDetailPesertaMagang(id),
  });

  const { data: absensiRes } = useQuery({
    queryKey: queryKeys.absensi.byPeserta(id),
    queryFn: () => services.absensi.getAllAbsensi({ rows: 10, filters: { pesertaMagangId: id } }),
  });

  const { data: jurnalRes } = useQuery({
    queryKey: queryKeys.jurnal.byPeserta(id),
    queryFn: () => services.jurnal.getAllJurnal({ rows: 10, filters: { pesertaMagangId: id } }),
  });

  const { data: penilaianRes } = useQuery({
    queryKey: queryKeys.penilaian.byPeserta(id),
    queryFn: () => services.penilaian.getAllPenilaian({ rows: 10, filters: { pesertaMagangId: id } }),
  });

  const { data: dokumenRes } = useQuery({
    queryKey: queryKeys.dokumen.byPeserta(id),
    queryFn: () => services.dokumen.getAllDokumen({ rows: 10, filters: { pesertaMagangId: id } }),
  });

  const peserta = pesertaRes?.content;
  const absensi = absensiRes?.content?.entries ?? [];
  const jurnal = jurnalRes?.content?.entries ?? [];
  const penilaian = penilaianRes?.content?.entries ?? [];
  const dokumen = dokumenRes?.content?.entries ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-24" />

        <Card>
          <CardContent className="flex flex-col gap-6 pt-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-14 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3.5 w-56" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!peserta) {
    return <p className="text-muted-foreground py-10 text-center text-sm">Peserta magang tidak ditemukan.</p>;
  }

  const initials = peserta.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link href="/peserta-magang">
          <Icon icon="lucide:arrow-left" /> Kembali
        </Link>
      </Button>

      <Card>
        <CardContent className="flex flex-col gap-6 pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-accent flex size-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold">{peserta.name}</h1>
                <Badge label={peserta.status} className={STATUS_MAGANG_BADGE_CLASS[peserta.status]} />
              </div>
              <p className="text-muted-foreground text-sm">{peserta.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-4">
            <div>
              <p className="text-muted-foreground text-xs font-semibold">No. HP</p>
              <p className="text-sm">{peserta.phoneNumber ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold">NIM/NIS</p>
              <p className="text-sm">{peserta.nim ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold">Divisi</p>
              <p className="text-sm">{peserta.divisi ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold">Instansi Asal</p>
              <p className="text-sm">{peserta.instansi ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold">Pembimbing Lapangan</p>
              <p className="text-sm">{peserta.pembimbingLapangan ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold">Tanggal Mulai</p>
              <p className="text-sm">{fmtDate(peserta.tanggalMulai)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold">Tanggal Selesai</p>
              <p className="text-sm">{fmtDate(peserta.tanggalSelesai)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Absensi Terbaru" icon="mdi:clock-edit-outline" emptyLabel="Belum ada catatan absensi.">
          {absensi.length > 0 && (
            <ul className="flex flex-col gap-3">
              {absensi.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{fmtDate(a.tanggal)}</span>
                  <Badge label={a.kehadiran} className={KEHADIRAN_BADGE_CLASS[a.kehadiran]} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Jurnal Kegiatan" icon="mdi:notebook-outline" emptyLabel="Belum ada jurnal kegiatan.">
          {jurnal.length > 0 && (
            <ul className="flex flex-col gap-3">
              {jurnal.map((j) => (
                <li key={j.id} className="text-sm">
                  <p className="text-muted-foreground text-xs">{fmtDate(j.tanggal)}</p>
                  <p className="line-clamp-2">{j.kegiatan}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Penilaian" icon="mdi:star-outline" emptyLabel="Belum ada penilaian.">
          {penilaian.length > 0 && (
            <ul className="flex flex-col gap-3">
              {penilaian.map((p) => (
                <li key={p.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Nilai: {p.nilai}</span>
                    <span className="text-muted-foreground text-xs">oleh {p.penilai}</span>
                  </div>
                  {p.komentar && <p className="text-muted-foreground mt-0.5">{p.komentar}</p>}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Dokumen" icon="mdi:file-document-outline" emptyLabel="Belum ada dokumen.">
          {dokumen.length > 0 && (
            <ul className="flex flex-col gap-3">
              {dokumen.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">{d.jenisDokumen.replace(/_/g, " ")}</p>
                    <p>{d.namaFile}</p>
                  </div>
                  <a
                    href={d.urlFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex shrink-0 items-center gap-1 text-xs font-semibold"
                  >
                    <Icon icon="lucide:external-link" /> Buka
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
