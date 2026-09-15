"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import type { TAbsensi } from "@/services/absensi/types";
import { cn } from "@/utils/classname";
import { FormDialog } from "./form-dialog";
import TableAbsensi from "./table";
import AbsensiHariIni from "./today";

type TTab = "today" | "history";

export default function Container() {
  const [tab, setTab] = useState<TTab>("today");
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<TAbsensi | null>(null);

  const openCreate = () => {
    setSelected(null);
    setFormOpen(true);
  };

  const openEdit = (row: TAbsensi) => {
    setSelected(row);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Kehadiran"
        title="Absensi"
        description="Catat kehadiran harian peserta magang dan kelola riwayatnya."
        icon="mdi:clock-edit-outline"
        actions={
          <>
            <div className="bg-muted/80 flex w-full items-center gap-1 rounded-xl border border-[#E2E8EA] p-1 sm:w-auto">
              <Button
                size="sm"
                variant={tab === "today" ? "default" : "ghost"}
                className={cn(
                  "h-8 flex-1 px-3 sm:flex-none",
                  tab !== "today" && "text-muted-foreground"
                )}
                onClick={() => setTab("today")}
              >
                Hari Ini
              </Button>
              <Button
                size="sm"
                variant={tab === "history" ? "default" : "ghost"}
                className={cn(
                  "h-8 flex-1 px-3 sm:flex-none",
                  tab !== "history" && "text-muted-foreground"
                )}
                onClick={() => setTab("history")}
              >
                Riwayat
              </Button>
            </div>
            {tab === "history" ? (
              <Button className="w-full sm:w-auto" onClick={openCreate}>
                <Icon icon="lucide:plus" />
                Tambah Absensi
              </Button>
            ) : null}
          </>
        }
      />

      {tab === "today" ? <AbsensiHariIni /> : <TableAbsensi onEdit={openEdit} />}

      <FormDialog open={formOpen} onOpenChange={setFormOpen} absensi={selected} />
    </div>
  );
}
