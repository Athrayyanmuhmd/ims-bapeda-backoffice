"use client";

import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ListFilters } from "@/components/list-filters";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";
import type { KEHADIRAN_OPTIONS } from "@/services/absensi/types";
import { cn } from "@/utils/classname";
import { nowJam, todayInApp, todayIsoDate } from "@/utils/datetime";
import { RosterItem, type RosterPeserta } from "./roster-item";

const SUMMARY_CONFIG = [
  {
    key: "hadir",
    label: "Hadir",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  {
    key: "sakitIzin",
    label: "Sakit/Izin",
    tone: "bg-orange-50 text-orange-700 ring-orange-100",
  },
  {
    key: "alpa",
    label: "Alpa",
    tone: "bg-red-50 text-red-700 ring-red-100",
  },
  {
    key: "belum",
    label: "Belum",
    tone: "bg-slate-50 text-slate-600 ring-slate-200/80",
  },
] as const;

export default function AbsensiHariIni() {
  const queryClient = useQueryClient();
  // "Today" is the office's day, not the browser's — otherwise the roster rolls
  // over at the wrong hour for anyone in another timezone.
  const [selectedDate, setSelectedDate] = useState(todayInApp);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const dateISO = selectedDate.toISODate() as string;
  const isToday = dateISO === todayIsoDate();

  const setFilter = (key: string, value: string | null) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (!value) delete next[key];
      else next[key] = value;
      return next;
    });
  };

  const { data: pesertaData, isLoading: isLoadingPeserta } = useQuery({
    queryKey: queryKeys.pesertaMagang.roster(),
    queryFn: () => services.pesertaMagang.getAllPesertaMagang({ rows: 200 }),
  });

  const { data: absensiData, isLoading: isLoadingAbsensi } = useQuery({
    queryKey: queryKeys.absensi.rosterByDate(dateISO),
    queryFn: () => services.absensi.getAllAbsensi({ rows: 200, filters: { tanggal: dateISO } }),
  });

  const isLoading = isLoadingPeserta || isLoadingAbsensi;

  const roster: RosterPeserta[] = useMemo(() => {
    const peserta = (pesertaData?.content?.entries ?? []).filter((p) => p.status === "AKTIF");
    const absensiByPeserta = new Map(
      (absensiData?.content?.entries ?? []).map((a) => [a.pesertaMagangId, a])
    );

    return peserta
      .map((p) => {
        const absensi = absensiByPeserta.get(p.id);
        return {
          pesertaMagangId: p.id,
          name: p.name,
          divisi: p.divisi,
          divisiId: p.divisiId,
          instansiId: p.instansiId,
          pembimbingLapangan: p.pembimbingLapangan,
          pembimbingLapanganId: p.pembimbingLapanganId,
          absensiId: absensi?.id ?? null,
          kehadiran: (absensi?.kehadiran as RosterPeserta["kehadiran"]) ?? null,
          jamMasuk: absensi?.jamMasuk ?? null,
          izinStatus: (absensi?.izinStatus as RosterPeserta["izinStatus"]) ?? null,
          izinJenis: (absensi?.izinJenis as RosterPeserta["izinJenis"]) ?? null,
          keterangan: absensi?.keterangan ?? null,
        };
      })
      .filter((p) => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filters.divisiId && p.divisiId !== filters.divisiId) return false;
        if (filters.instansiId && p.instansiId !== filters.instansiId) return false;
        if (filters.pembimbingLapanganId && p.pembimbingLapanganId !== filters.pembimbingLapanganId) {
          return false;
        }
        if (filters.kehadiran && p.kehadiran !== filters.kehadiran) return false;
        return true;
      });
  }, [pesertaData, absensiData, search, filters]);

  const groups = useMemo(() => {
    const byDivisi = new Map<string, RosterPeserta[]>();
    roster.forEach((p) => {
      const key = p.divisi ?? "Tanpa Divisi";
      if (!byDivisi.has(key)) byDivisi.set(key, []);
      byDivisi.get(key)?.push(p);
    });
    // Block body, not a concise arrow: sort() returns the array, and a forEach
    // callback that returns a value reads like a map that forgot its result.
    byDivisi.forEach((list) => {
      list.sort((a, b) => Number(!!a.kehadiran) - Number(!!b.kehadiran));
    });
    return Array.from(byDivisi.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [roster]);

  const summary = useMemo(() => {
    const counts = { hadir: 0, sakitIzin: 0, alpa: 0, belum: 0 };
    roster.forEach((p) => {
      if (p.kehadiran === "Hadir") counts.hadir++;
      else if (
        p.izinStatus === "PENDING" ||
        p.kehadiran === "Sakit" ||
        p.kehadiran === "Izin"
      )
        counts.sakitIzin++;
      else if (p.kehadiran === "Alpa") counts.alpa++;
      else counts.belum++;
    });
    return counts;
  }, [roster]);

  const markMutation = useMutation({
    mutationFn: ({
      peserta,
      kehadiran,
    }: {
      peserta: RosterPeserta;
      kehadiran: (typeof KEHADIRAN_OPTIONS)[number];
    }) => {
      // Only stamp "now" as jam masuk when marking today live. Marking a past
      // date (lupa absen) records the status without guessing a time — edit
      // the real time afterwards from Riwayat if it matters.
      const jamMasuk = kehadiran === "Hadir" && isToday ? `${dateISO}T${nowJam()}:00` : undefined;

      return peserta.absensiId
        ? services.absensi.updateAbsensi(peserta.absensiId, { kehadiran, jamMasuk })
        : services.absensi.createAbsensi({
            pesertaMagangId: peserta.pesertaMagangId,
            kehadiran,
            tanggal: dateISO,
            jamMasuk,
          });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.absensi.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const izinMutation = useMutation({
    mutationFn: ({
      absensiId,
      action,
    }: {
      absensiId: string;
      action: "approve" | "reject";
    }) =>
      action === "approve"
        ? services.absensi.approveIzin(absensiId)
        : services.absensi.rejectIzin(absensiId),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.absensi.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const bulkHadirMutation = useMutation({
    mutationFn: async () => {
      const belum = roster.filter((p) => !p.kehadiran && p.izinStatus !== "PENDING");
      const jamMasuk = isToday ? `${dateISO}T${nowJam()}:00` : undefined;
      await Promise.all(
        belum.map((p) =>
          services.absensi.createAbsensi({
            pesertaMagangId: p.pesertaMagangId,
            kehadiran: "Hadir",
            tanggal: dateISO,
            jamMasuk,
          })
        )
      );
    },
    onSuccess: () => {
      toast.success("Sisanya berhasil ditandai Hadir");
      queryClient.invalidateQueries({ queryKey: queryKeys.absensi.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8EA] bg-white p-3 shadow-[0_1px_2px_rgba(15,76,92,0.04)] lg:flex-row lg:items-stretch lg:gap-4">
        <div className="flex shrink-0 items-center justify-center gap-2 lg:justify-start lg:pr-2">
          <Button
            variant="outline"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => setSelectedDate((d) => d.minus({ days: 1 }))}
          >
            <Icon icon="lucide:chevron-left" />
          </Button>
          <div className="min-w-[9.5rem] px-1 text-center lg:min-w-44 lg:text-left">
            <p className="text-sm font-semibold tracking-tight">
              {selectedDate.setLocale("id").toFormat("cccc, d LLL yyyy")}
            </p>
            {isToday ? (
              <p className="text-primary text-[11px] font-semibold tracking-wide uppercase">
                Hari ini
              </p>
            ) : (
              <p className="text-muted-foreground text-[11px]">Riwayat tanggal</p>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => setSelectedDate((d) => d.plus({ days: 1 }))}
          >
            <Icon icon="lucide:chevron-right" />
          </Button>
        </div>

        <div
          className="hidden w-px shrink-0 bg-[#E8EEF0] lg:block"
          aria-hidden
        />

        <div className="grid min-w-0 flex-1 grid-cols-4 gap-2">
          {SUMMARY_CONFIG.map((s) => (
            <div
              key={s.key}
              className={cn(
                "flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 ring-1 ring-inset",
                s.tone
              )}
            >
              <span className="font-display text-xl font-semibold tabular-nums leading-none lg:text-2xl">
                {summary[s.key]}
              </span>
              <span className="text-center text-[10px] font-semibold tracking-wide uppercase opacity-80">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 rounded-xl border border-[#E2E8EA] bg-white p-3 shadow-[0_1px_2px_rgba(15,76,92,0.04)]">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            <InputGroup className="h-9 w-full border-transparent bg-[#F7FAFB]">
              <InputGroupInput
                placeholder="Cari nama peserta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent"
              />
              <InputGroupAddon align="inline-start">
                <Icon icon="lucide:search" />
              </InputGroupAddon>
            </InputGroup>
            <ListFilters values={filters} onChange={setFilter} showKehadiran />
          </div>

          <Button
            variant="outline"
            className="shrink-0"
            onClick={() => bulkHadirMutation.mutate()}
            isLoading={bulkHadirMutation.isPending}
            disabled={bulkHadirMutation.isPending || summary.belum === 0}
          >
            <Icon icon="lucide:check-check" /> Tandai sisanya Hadir
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card flex items-center gap-3 rounded-xl border px-3 py-2.5">
              <Skeleton className="size-8 shrink-0 rounded-lg" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-7 w-14 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          Tidak ada peserta magang aktif.
        </p>
      ) : (
        groups.map(([divisi, list]) => {
          const done = list.filter((p) => p.kehadiran && p.izinStatus !== "PENDING").length;
          return (
            <div key={divisi} className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 px-0.5">
                <span className="text-sm font-bold">{divisi}</span>
                <span
                  className={cn(
                    "font-mono text-xs",
                    done === list.length ? "text-green-600" : "text-muted-foreground"
                  )}
                >
                  {done}/{list.length} sudah absen
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {list.map((p) => (
                  <RosterItem
                    key={p.pesertaMagangId}
                    peserta={p}
                    dense
                    isPending={markMutation.isPending || izinMutation.isPending}
                    onMark={(kehadiran) => markMutation.mutate({ peserta: p, kehadiran })}
                    onApproveIzin={() =>
                      p.absensiId &&
                      izinMutation.mutate({ absensiId: p.absensiId, action: "approve" })
                    }
                    onRejectIzin={() =>
                      p.absensiId &&
                      izinMutation.mutate({ absensiId: p.absensiId, action: "reject" })
                    }
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
