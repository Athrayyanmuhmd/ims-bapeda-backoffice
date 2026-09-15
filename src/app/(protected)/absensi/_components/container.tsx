"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/classname";
import TableAbsensi from "./table";
import AbsensiHariIni from "./today";

type TTab = "today" | "history";

export default function Container() {
  const [tab, setTab] = useState<TTab>("today");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Kehadiran"
        title="Absensi"
        description="Catat kehadiran harian peserta magang dan kelola riwayatnya."
        actions={
          <div className="bg-muted/80 flex items-center gap-1 rounded-xl border border-[#E2E8EA] p-1">
            <Button
              size="sm"
              variant={tab === "today" ? "default" : "ghost"}
              className={cn(tab !== "today" && "text-muted-foreground")}
              onClick={() => setTab("today")}
            >
              Hari Ini
            </Button>
            <Button
              size="sm"
              variant={tab === "history" ? "default" : "ghost"}
              className={cn(tab !== "history" && "text-muted-foreground")}
              onClick={() => setTab("history")}
            >
              Riwayat
            </Button>
          </div>
        }
      />

      {tab === "today" ? <AbsensiHariIni /> : <TableAbsensi />}
    </div>
  );
}
