"use client";

import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";
import { KEHADIRAN_OPTIONS } from "@/services/absensi/types";
import { fmtTanggalLong, fmtTanggalShort, hariKerjaEfektif, todayInApp } from "@/utils/datetime";

// Full history, not the 10-row preview the detail page shows.
// ponytail: one capped request per section instead of paging. A single magang
// runs a few months, so 500 rows is far past any real total.
const REPORT_ROWS = 500;

const fmtDate = fmtTanggalLong;
const fmtShortDate = fmtTanggalShort;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="w-48 py-1 align-top text-sm">{label}</td>
      <td className="py-1 align-top text-sm">: {value}</td>
    </tr>
  );
}

export default function Container({ id }: { id: string }) {
  const { data: pesertaRes, isLoading } = useQuery({
    queryKey: queryKeys.pesertaMagang.detail(id),
    queryFn: () => services.pesertaMagang.getDetailPesertaMagang(id),
  });

  const { data: absensiRes } = useQuery({
    queryKey: queryKeys.absensi.report(id),
    queryFn: () =>
      services.absensi.getAllAbsensi({
        rows: REPORT_ROWS,
        orderKey: "tanggal",
        orderRule: "asc",
        filters: { pesertaMagangId: id },
      }),
  });

  const { data: logbookRes } = useQuery({
    queryKey: queryKeys.logbook.report(id),
    queryFn: () =>
      services.logbook.getAllLogbook({
        rows: REPORT_ROWS,
        orderKey: "tanggal",
        orderRule: "asc",
        filters: { pesertaMagangId: id },
      }),
  });

  const { data: penilaianRes } = useQuery({
    queryKey: queryKeys.penilaian.report(id),
    queryFn: () =>
      services.penilaian.getAllPenilaian({ rows: REPORT_ROWS, filters: { pesertaMagangId: id } }),
  });

  const peserta = pesertaRes?.content;
  const absensi = absensiRes?.content?.entries ?? [];
  const logbook = logbookRes?.content?.entries ?? [];
  const penilaian = penilaianRes?.content?.entries ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  if (!peserta) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        Peserta magang tidak ditemukan.
      </p>
    );
  }

  const rekap = KEHADIRAN_OPTIONS.map((kehadiran) => ({
    kehadiran,
    total: absensi.filter(
      (a) => a.kehadiran === kehadiran && (a as { izinStatus?: string | null }).izinStatus !== "PENDING"
    ).length,
  }));

  const totalHadir = rekap.find((r) => r.kehadiran === "Hadir")?.total ?? 0;
  // Prefer API (includes national holidays); fall back to weekday-only client count.
  const hariKerja =
    peserta.hariKerjaPeriode ??
    hariKerjaEfektif(peserta.tanggalMulai, peserta.tanggalSelesai);
  const persenKehadiran =
    hariKerja > 0 ? Math.min(100, Math.round((totalHadir / hariKerja) * 100)) : 0;

  const rataNilai =
    penilaian.length > 0
      ? Math.round(penilaian.reduce((sum, p) => sum + p.nilai, 0) / penilaian.length)
      : null;

  const periode = `${fmtDate(peserta.tanggalMulai)} s.d. ${fmtDate(peserta.tanggalSelesai)}`;

  function handlePrint() {
    // Browser print chrome uses document.title for the header label ("SIMAGANG").
    const previousTitle = document.title;
    document.title = " ";
    const restore = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  }

  return (
    <div className="flex flex-col gap-4 print:gap-0">
      {/* Screen-only controls — also display:none via [data-print-hide]. */}
      <div data-print-hide className="flex flex-col gap-2 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href={`/peserta-magang/${id}`}>
            <Icon icon="lucide:arrow-left" /> Kembali
          </Link>
        </Button>
        <Button size="sm" onClick={handlePrint}>
          <Icon icon="lucide:printer" /> Cetak / Simpan PDF
        </Button>
      </div>

      <div
        data-print-area
        className="mx-auto w-full max-w-[210mm] bg-white p-8 text-black shadow-sm print:mx-0 print:max-w-none print:shadow-none"
      >
        {/* Kop surat perangkat daerah — format naskah dinas Kota Banda Aceh. */}
        <div className="border-b-[3px] border-double border-black pb-3">
          <div className="flex items-start gap-4">
            <img
              src="/logo.png"
              alt="Logo Bapeda"
              width={88}
              height={88}
              className="mt-0.5 size-[72px] shrink-0 object-contain sm:size-[88px] print:size-[22mm]"
            />
            <div className="min-w-0 flex-1 text-center">
              <p className="text-[13px] font-bold tracking-[0.12em] uppercase sm:text-sm">
                Pemerintah Kota Banda Aceh
              </p>
              <p className="mt-0.5 text-base leading-tight font-bold tracking-wide uppercase sm:text-lg">
                Badan Perencanaan Pembangunan Daerah
              </p>
              <p className="mt-1.5 text-[11px] leading-snug sm:text-xs">
                Jalan Nyak Adam Kamil No. 19, Neusu Jaya, Baiturrahman, Kota Banda Aceh
              </p>
              <p className="text-[11px] leading-snug sm:text-xs">
                Telp. (0651) 32398 &nbsp;·&nbsp; Fax. (0651) 32397 &nbsp;·&nbsp; Email:
                bappeda@bandaacehkota.go.id
              </p>
            </div>
            {/* Mirror spacer so the text block stays visually centered with the logo. */}
            <div className="hidden size-[72px] shrink-0 sm:block print:block print:size-[22mm]" aria-hidden />
          </div>
        </div>

        <div className="mt-5 mb-1 text-center">
          <h1 className="text-base font-bold tracking-wide uppercase sm:text-lg">
            Laporan Kegiatan Magang
          </h1>
          <p className="text-xs text-gray-700 sm:text-sm">Sistem Manajemen Magang (SIMAGANG)</p>
        </div>

        <section className="mt-5">
          <h2 className="mb-2 text-sm font-bold uppercase">A. Identitas Peserta</h2>
          <table className="w-full">
            <tbody>
              <Row label="Nama" value={peserta.name} />
              <Row label="NIM / NIS" value={peserta.nim ?? "-"} />
              <Row label="Instansi Asal" value={peserta.instansi ?? "-"} />
              <Row label="Divisi Penempatan" value={peserta.divisi ?? "-"} />
              <Row label="Pembimbing Lapangan" value={peserta.pembimbingLapangan ?? "-"} />
              <Row label="Periode Magang" value={periode} />
              <Row label="Status" value={peserta.status} />
            </tbody>
          </table>
        </section>

        <section className="mt-5">
          <h2 className="mb-2 text-sm font-bold uppercase">B. Rekapitulasi Kehadiran</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                {rekap.map((r) => (
                  <th
                    key={r.kehadiran}
                    className="border border-gray-400 px-2 py-1 text-left font-semibold"
                  >
                    {r.kehadiran}
                  </th>
                ))}
                <th className="border border-gray-400 px-2 py-1 text-left font-semibold">
                  Hari Kerja
                </th>
                <th className="border border-gray-400 px-2 py-1 text-left font-semibold">
                  % Kehadiran
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {rekap.map((r) => (
                  <td key={r.kehadiran} className="border border-gray-400 px-2 py-1 tabular-nums">
                    {r.total}
                  </td>
                ))}
                <td className="border border-gray-400 px-2 py-1 tabular-nums">{hariKerja}</td>
                <td className="border border-gray-400 px-2 py-1 tabular-nums">
                  {persenKehadiran}%
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-1.5 text-[11px] text-gray-600">
            Hari kerja = hari kerja efektif (Sen–Jum, non-libur nasional) dari tanggal mulai s.d.
            hari ini atau tanggal selesai. % kehadiran = Hadir ÷ Hari Kerja.
          </p>
        </section>

        <section className="mt-5">
          <h2 className="mb-2 text-sm font-bold uppercase">C. Logbook Kegiatan</h2>
          {logbook.length === 0 ? (
            <p className="text-sm italic">Belum ada logbook kegiatan yang tercatat.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="w-10 border border-gray-400 px-2 py-1 text-left font-semibold">
                    No
                  </th>
                  <th className="w-28 border border-gray-400 px-2 py-1 text-left font-semibold">
                    Tanggal
                  </th>
                  <th className="border border-gray-400 px-2 py-1 text-left font-semibold">
                    Uraian Kegiatan
                  </th>
                </tr>
              </thead>
              <tbody>
                {logbook.map((j, index) => (
                  <tr key={j.id}>
                    <td className="border border-gray-400 px-2 py-1 align-top tabular-nums">
                      {index + 1}
                    </td>
                    <td className="border border-gray-400 px-2 py-1 align-top whitespace-nowrap">
                      {fmtShortDate(j.tanggal)}
                    </td>
                    <td className="border border-gray-400 px-2 py-1 align-top">{j.kegiatan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="mt-5">
          <h2 className="mb-2 text-sm font-bold uppercase">D. Penilaian</h2>
          {penilaian.length === 0 ? (
            <p className="text-sm italic">Belum ada penilaian yang diberikan.</p>
          ) : (
            <>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 px-2 py-1 text-left font-semibold">
                      Penilai
                    </th>
                    <th className="w-20 border border-gray-400 px-2 py-1 text-left font-semibold">
                      Nilai
                    </th>
                    <th className="border border-gray-400 px-2 py-1 text-left font-semibold">
                      Komentar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {penilaian.map((p) => (
                    <tr key={p.id}>
                      <td className="border border-gray-400 px-2 py-1 align-top">{p.penilai}</td>
                      <td className="border border-gray-400 px-2 py-1 align-top tabular-nums">
                        {p.nilai}
                      </td>
                      <td className="border border-gray-400 px-2 py-1 align-top">
                        {p.komentar ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-sm font-semibold">Nilai rata-rata: {rataNilai}</p>
            </>
          )}
        </section>

        <section data-print-keep className="mt-10 flex justify-end">
          <div className="w-64 text-center text-sm">
            <p>Banda Aceh, {todayInApp().setLocale("id").toFormat("d LLLL yyyy")}</p>
            <p className="mt-1">Pembimbing Lapangan,</p>
            <div className="h-20" />
            <p className="font-semibold underline">{peserta.pembimbingLapangan ?? "……………………………"}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
