import { Icon } from "@iconify/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function CtaBanner() {
  return (
    <Card className="bg-primary border-none">
      <CardContent className="relative overflow-hidden">
        <Icon
          icon="mdi:calendar-check-outline"
          className="text-primary-foreground/10 absolute -top-4 -right-4 size-28"
        />
        <div className="relative flex flex-col gap-3">
          <p className="text-primary-foreground/70 text-xs font-semibold tracking-wide uppercase">
            Jangan lupa
          </p>
          <h3 className="font-display text-primary-foreground text-xl font-semibold text-balance">
            Lengkapi absensi peserta magang hari ini
          </h3>
          <p className="text-primary-foreground/70 text-sm">
            Tandai kehadiran sebelum jam kerja berakhir agar rekap tetap akurat.
          </p>
          <Link
            href="/absensi"
            className="bg-background text-foreground mt-1 inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          >
            Buka Absensi
            <Icon icon="mdi:arrow-right" className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
