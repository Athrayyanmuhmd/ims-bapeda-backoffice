"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { services } from "@/services";
import type { TAbsensi } from "@/services/absensi/types";
import { type CsvColumn, downloadCsv, toCsv } from "@/utils/csv";
import { fmtJam, toDateInput } from "@/utils/datetime";

// ponytail: one request capped at 2000 rows rather than paging the whole range
// — that's ~8 peserta over a full year. The toast says so when a rekap is
// truncated; page the fetch if that ever actually happens.
const MAX_ROWS = 2000;

// Same shared formatters the table cells use, so the file matches the screen:
// tanggal read as a calendar date, jam in the office timezone.
const COLUMNS: CsvColumn<TAbsensi>[] = [
  { header: "Nama", value: (r) => r.name },
  { header: "Divisi", value: (r) => r.divisi },
  { header: "Pembimbing Lapangan", value: (r) => r.pembimbingLapangan },
  { header: "Tanggal", value: (r) => toDateInput(r.tanggal) },
  { header: "Kehadiran", value: (r) => r.kehadiran },
  {
    header: "Status Izin",
    value: (r) =>
      r.izinStatus === "PENDING"
        ? "Menunggu"
        : r.izinStatus === "APPROVED"
          ? "Disetujui"
          : r.izinStatus === "REJECTED"
            ? "Ditolak"
            : "",
  },
  { header: "Jam Masuk", value: (r) => (r.jamMasuk ? fmtJam(r.jamMasuk) : "") },
  { header: "Jam Keluar", value: (r) => (r.jamKeluar ? fmtJam(r.jamKeluar) : "") },
  { header: "Keterangan", value: (r) => r.keterangan },
];

export function ExportCsv() {
  const [dariTanggal, setDariTanggal] = useState("");
  const [sampaiTanggal, setSampaiTanggal] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const isRangeInverted = !!dariTanggal && !!sampaiTanggal && dariTanggal > sampaiTanggal;

  const onExport = async () => {
    if (isRangeInverted) {
      toast.error("Tanggal 'dari' harus lebih awal dari tanggal 'sampai'");
      return;
    }

    setIsExporting(true);
    try {
      const response = await services.absensi.getAllAbsensi({
        rows: MAX_ROWS,
        orderKey: "tanggal",
        orderRule: "asc",
        filters: {
          ...(dariTanggal ? { dariTanggal } : {}),
          ...(sampaiTanggal ? { sampaiTanggal } : {}),
        },
      });

      const entries = response.content?.entries ?? [];
      const totalData = response.content?.totalData ?? 0;

      if (entries.length === 0) {
        toast.error("Tidak ada data absensi pada periode tersebut");
        return;
      }

      const periode = [dariTanggal || "awal", sampaiTanggal || "akhir"].join("_sd_");
      downloadCsv(`rekap-absensi-${periode}.csv`, toCsv(entries, COLUMNS));

      if (totalData > entries.length) {
        toast.warning(
          `Hanya ${entries.length} dari ${totalData} baris yang diekspor. Persempit rentang tanggalnya.`
        );
      } else {
        toast.success(`${entries.length} baris absensi diekspor`);
      }
    } catch (error) {
      toast.error((error as { message?: string }).message ?? "Gagal mengekspor rekap absensi");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
      <Input
        type="date"
        aria-label="Dari tanggal"
        title="Dari tanggal"
        value={dariTanggal}
        max={sampaiTanggal || undefined}
        onChange={(e) => setDariTanggal(e.target.value)}
        className="h-9 w-full min-w-0 max-w-full border-[#D7E2E5] bg-white md:w-auto md:min-w-[10.5rem]"
      />
      <Input
        type="date"
        aria-label="Sampai tanggal"
        title="Sampai tanggal"
        value={sampaiTanggal}
        min={dariTanggal || undefined}
        onChange={(e) => setSampaiTanggal(e.target.value)}
        className="h-9 w-full min-w-0 max-w-full border-[#D7E2E5] bg-white md:w-auto md:min-w-[10.5rem]"
      />
      <Button
        variant="outline"
        className="h-9 w-full shrink-0 border-[#D7E2E5] bg-white md:w-auto"
        onClick={onExport}
        isLoading={isExporting}
        disabled={isExporting || isRangeInverted}
      >
        <Icon icon="lucide:download" />
        Export CSV
      </Button>
    </div>
  );
}
