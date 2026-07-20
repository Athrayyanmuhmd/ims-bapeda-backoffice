"use client";

import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";
import { KEHADIRAN_OPTIONS } from "@/services/absensi/types";
import { cn } from "@/utils/classname";
import { RosterItem, type RosterPeserta } from "./roster-item";

type TView = "cards" | "rows";

const SUMMARY_CONFIG = [
  { key: "hadir", label: "Hadir", color: "text-green-600" },
  { key: "sakitIzin", label: "Sakit/Izin", color: "text-orange-600" },
  { key: "alpa", label: "Alpa", color: "text-red-600" },
  { key: "belum", label: "Belum Absen", color: "text-muted-foreground" },
] as const;

export default function AbsensiHariIni() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => DateTime.now().startOf("day"));
  const [view, setView] = useState<TView>("cards");
  const [search, setSearch] = useState("");
  const dateISO = selectedDate.toISODate() as string;
  const isToday = selectedDate.hasSame(DateTime.now(), "day");

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
      (absensiData?.content?.entries ?? []).map((a) => [a.pesertaMagangId, a]),
    );

    return peserta
      .map((p) => {
        const absensi = absensiByPeserta.get(p.id);
        return {
          pesertaMagangId: p.id,
          name: p.name,
          divisi: p.divisi,
          pembimbingLapangan: p.pembimbingLapangan,
          absensiId: absensi?.id ?? null,
          kehadiran: (absensi?.kehadiran as RosterPeserta["kehadiran"]) ?? null,
          jamMasuk: absensi?.jamMasuk ?? null,
        };
      })
      .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  }, [pesertaData, absensiData, search]);

  const groups = useMemo(() => {
    const byDivisi = new Map<string, RosterPeserta[]>();
    roster.forEach((p) => {
      const key = p.divisi ?? "Tanpa Divisi";
      if (!byDivisi.has(key)) byDivisi.set(key, []);
      byDivisi.get(key)?.push(p);
    });
    byDivisi.forEach((list) =>
      list.sort((a, b) => Number(!!a.kehadiran) - Number(!!b.kehadiran)),
    );
    return Array.from(byDivisi.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [roster]);

  const summary = useMemo(() => {
    const counts = { hadir: 0, sakitIzin: 0, alpa: 0, belum: 0 };
    roster.forEach((p) => {
      if (p.kehadiran === "Hadir") counts.hadir++;
      else if (p.kehadiran === "Sakit" || p.kehadiran === "Izin") counts.sakitIzin++;
      else if (p.kehadiran === "Alpa") counts.alpa++;
      else counts.belum++;
    });
    return counts;
  }, [roster]);

  const markMutation = useMutation({
    mutationFn: ({ peserta, kehadiran }: { peserta: RosterPeserta; kehadiran: (typeof KEHADIRAN_OPTIONS)[number] }) => {
      // Only stamp "now" as jam masuk when marking today live. Marking a past
      // date (lupa absen) records the status without guessing a time — edit
      // the real time afterwards from Riwayat if it matters.
      const now = DateTime.now().toFormat("HH:mm");
      const jamMasuk = kehadiran === "Hadir" && isToday ? `${dateISO}T${now}:00` : undefined;

      return peserta.absensiId
        ? services.absensi.updateAbsensi(peserta.absensiId, { kehadiran, jamMasuk })
        : services.absensi.createAbsensi({ pesertaMagangId: peserta.pesertaMagangId, kehadiran, tanggal: dateISO, jamMasuk });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.absensi.all });
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const bulkHadirMutation = useMutation({
    mutationFn: async () => {
      const belum = roster.filter((p) => !p.kehadiran);
      const now = DateTime.now().toFormat("HH:mm");
      const jamMasuk = isToday ? `${dateISO}T${now}:00` : undefined;
      await Promise.all(
        belum.map((p) =>
          services.absensi.createAbsensi({
            pesertaMagangId: p.pesertaMagangId,
            kehadiran: "Hadir",
            tanggal: dateISO,
            jamMasuk,
          }),
        ),
      );
    },
    onSuccess: () => {
      toast.success("Sisanya berhasil ditandai Hadir");
      queryClient.invalidateQueries({ queryKey: queryKeys.absensi.all });
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate((d) => d.minus({ days: 1 }))}
          >
            <Icon icon="lucide:chevron-left" />
          </Button>
          <div className="min-w-[170px]">
            <p className="text-sm font-semibold">
              {selectedDate.setLocale("id").toFormat("cccc, d LLL yyyy")}
            </p>
            {isToday && <p className="text-primary text-xs font-semibold">Hari ini</p>}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate((d) => d.plus({ days: 1 }))}
          >
            <Icon icon="lucide:chevron-right" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {SUMMARY_CONFIG.map((s) => (
          <Card key={s.key}>
            <CardContent className="flex items-center justify-between py-4">
              <span className="text-muted-foreground text-xs font-semibold">{s.label}</span>
              <span className={cn("font-mono text-2xl font-bold tabular-nums", s.color)}>
                {summary[s.key]}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <InputGroup className="max-w-sm flex-1">
          <InputGroupInput
            placeholder="Cari nama peserta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroupAddon align="inline-start">
            <Icon icon="lucide:search" />
          </InputGroupAddon>
        </InputGroup>

        <div className="bg-accent flex items-center gap-1 rounded-lg p-1">
          <Button
            size="sm"
            variant={view === "cards" ? "default" : "ghost"}
            onClick={() => setView("cards")}
          >
            <Icon icon="lucide:layout-grid" /> Kartu
          </Button>
          <Button size="sm" variant={view === "rows" ? "default" : "ghost"} onClick={() => setView("rows")}>
            <Icon icon="lucide:list" /> Daftar
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={() => bulkHadirMutation.mutate()}
          isLoading={bulkHadirMutation.isPending}
          disabled={bulkHadirMutation.isPending || summary.belum === 0}
        >
          <Icon icon="lucide:check-check" /> Tandai sisanya Hadir
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card flex flex-col gap-3 rounded-xl border p-3.5">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-7 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center text-sm">Tidak ada peserta magang aktif.</p>
      ) : (
        groups.map(([divisi, list]) => {
          const done = list.filter((p) => p.kehadiran).length;
          return (
            <div key={divisi} className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 px-0.5">
                <span className="text-sm font-bold">{divisi}</span>
                <span
                  className={cn(
                    "font-mono text-xs",
                    done === list.length ? "text-green-600" : "text-muted-foreground",
                  )}
                >
                  {done}/{list.length} sudah absen
                </span>
              </div>
              <div className={view === "cards" ? "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-1.5"}>
                {list.map((p) => (
                  <RosterItem
                    key={p.pesertaMagangId}
                    peserta={p}
                    dense={view === "rows"}
                    isPending={markMutation.isPending}
                    onMark={(kehadiran) => markMutation.mutate({ peserta: p, kehadiran })}
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
