"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AbsensiHariIni from "./today";
import TableAbsensi from "./table";

type TTab = "today" | "history";

export default function Container() {
  const [tab, setTab] = useState<TTab>("today");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Absensi</h1>
          <p className="text-muted-foreground text-sm">Catat kehadiran harian peserta magang.</p>
        </div>
        <div className="bg-accent flex items-center gap-1 rounded-lg p-1">
          <Button size="sm" variant={tab === "today" ? "default" : "ghost"} onClick={() => setTab("today")}>
            Hari Ini
          </Button>
          <Button size="sm" variant={tab === "history" ? "default" : "ghost"} onClick={() => setTab("history")}>
            Riwayat
          </Button>
        </div>
      </div>

      {tab === "today" ? <AbsensiHariIni /> : <TableAbsensi />}
    </div>
  );
}
