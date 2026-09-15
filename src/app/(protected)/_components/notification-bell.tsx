"use client";

import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { queryKeys } from "@/constants/query-keys";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  belumAbsenKey,
  endingSoonKey,
  useNotifSeen,
  type NotifKind,
} from "@/hooks/use-notif-seen";
import { getSummary, type TNotificationSummary } from "@/services/notifications";
import { useAuth } from "@/stores/auth";
import { cn } from "@/utils/classname";
import { fmtTanggal } from "@/utils/datetime";

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

type Tone = "amber" | "orange" | "red" | "teal";

const TONE: Record<Tone, { chip: string; icon: string; avatar: string }> = {
  amber: {
    chip: "bg-amber-50 text-amber-800 border-amber-100",
    icon: "bg-amber-100 text-amber-700",
    avatar: "bg-amber-100 text-amber-800",
  },
  orange: {
    chip: "bg-orange-50 text-orange-800 border-orange-100",
    icon: "bg-orange-100 text-orange-700",
    avatar: "bg-orange-100 text-orange-800",
  },
  red: {
    chip: "bg-red-50 text-red-800 border-red-100",
    icon: "bg-red-100 text-red-700",
    avatar: "bg-red-100 text-red-800",
  },
  teal: {
    chip: "bg-[#E8F3F5] text-[#0F4C5C] border-[#D4E8EC]",
    icon: "bg-[#D4E8EC] text-[#0F4C5C]",
    avatar: "bg-[#E8F3F5] text-[#0F4C5C]",
  },
};

function endingLabel(daysLeft: number) {
  if (daysLeft < 0) return `Lewat ${Math.abs(daysLeft)} hari`;
  if (daysLeft === 0) return "Berakhir hari ini";
  return `${daysLeft} hari lagi`;
}

function endingTone(daysLeft: number): Tone {
  if (daysLeft < 0) return "red";
  if (daysLeft <= 7) return "orange";
  return "amber";
}

function NotifBellButton({
  total,
  className,
  ...props
}: ComponentProps<typeof Button> & { total: number }) {
  return (
    <Button variant="ghost" size="icon" className={cn("relative", className)} {...props}>
      <Icon icon="mdi:bell-outline" className="size-5" />
      {total > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
          {total > 99 ? "99+" : total}
        </span>
      )}
      <span className="sr-only">Notifikasi</span>
    </Button>
  );
}

function SectionHeader({
  icon,
  title,
  count,
  tone,
}: {
  icon: string;
  title: string;
  count: number;
  tone: Tone;
}) {
  const styles = TONE[tone];
  return (
    <div className="flex items-center gap-2 px-1">
      <span className={cn("flex size-7 items-center justify-center rounded-lg", styles.icon)}>
        <Icon icon={icon} className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tracking-tight">{title}</p>
      </div>
      <span
        className={cn(
          "rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums",
          styles.chip
        )}
      >
        {count}
      </span>
    </div>
  );
}

function NotifRow({
  href,
  name,
  meta,
  tone,
  onNavigate,
}: {
  href: string;
  name: string;
  meta: string;
  tone: Tone;
  onNavigate?: () => void;
}) {
  const styles = TONE[tone];
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="hover:bg-muted/60 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          styles.avatar
        )}
      >
        {initials(name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-muted-foreground truncate text-xs">{meta}</p>
      </div>
      <Icon icon="lucide:chevron-right" className="text-muted-foreground size-4 shrink-0" />
    </Link>
  );
}

type VisibleSummary = {
  pendingIzin: TNotificationSummary["pendingIzin"];
  belumAbsen: TNotificationSummary["belumAbsen"];
  endingSoon: TNotificationSummary["endingSoon"];
  counts: {
    pendingIzin: number;
    belumAbsen: number;
    endingSoon: number;
  };
  total: number;
  allKeys: { kind: NotifKind; key: string }[];
};

function NotificationBody({
  visible,
  onMarkItem,
  onMarkAll,
}: {
  visible: VisibleSummary;
  onMarkItem: (kind: NotifKind, key: string) => void;
  onMarkAll?: () => void;
}) {
  if (visible.total === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
        <span className="bg-muted flex size-12 items-center justify-center rounded-2xl">
          <Icon icon="mdi:bell-check-outline" className="text-muted-foreground size-6" />
        </span>
        <p className="text-sm font-medium">Semua aman</p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Tidak ada item yang belum dilihat, atau semua sudah ditindaklanjuti.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {onMarkAll ? (
        <div className="flex justify-end px-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-8 px-2 text-xs"
            onClick={onMarkAll}
          >
            <Icon icon="mdi:check-all" className="size-4" />
            Tandai semua dilihat
          </Button>
        </div>
      ) : null}

      {visible.pendingIzin.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <SectionHeader
            icon="mdi:file-document-alert-outline"
            title="Izin menunggu"
            count={visible.counts.pendingIzin}
            tone="orange"
          />
          <div className="flex flex-col">
            {visible.pendingIzin.slice(0, 5).map((item) => (
              <NotifRow
                key={item.id}
                href="/absensi"
                name={`${item.name} · ${item.jenis}`}
                meta={`${fmtTanggal(item.tanggal)}${item.divisi ? ` · ${item.divisi}` : ""}`}
                tone="orange"
                onNavigate={() => onMarkItem("pendingIzin", item.id)}
              />
            ))}
          </div>
        </section>
      )}

      {visible.belumAbsen.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <SectionHeader
            icon="mdi:clock-alert-outline"
            title="Belum absen hari ini"
            count={visible.counts.belumAbsen}
            tone="amber"
          />
          <div className="flex flex-col">
            {visible.belumAbsen.slice(0, 5).map((item) => (
              <NotifRow
                key={item.id}
                href="/absensi"
                name={item.name}
                meta={item.divisi ?? "Tanpa divisi"}
                tone="amber"
                onNavigate={() => onMarkItem("belumAbsen", belumAbsenKey(item.id))}
              />
            ))}
          </div>
        </section>
      )}

      {visible.endingSoon.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <SectionHeader
            icon="mdi:calendar-end"
            title="Magang segera berakhir"
            count={visible.counts.endingSoon}
            tone="teal"
          />
          <div className="flex flex-col">
            {visible.endingSoon.slice(0, 5).map((item) => (
              <NotifRow
                key={item.id}
                href={`/peserta-magang/${item.id}`}
                name={item.name}
                meta={endingLabel(item.daysLeft)}
                tone={endingTone(item.daysLeft)}
                onNavigate={() =>
                  onMarkItem("endingSoon", endingSoonKey(item.id, item.tanggalSelesai))
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function NotificationBell() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const userId = useAuth((s) => s.user?.id);
  const { isSeen, markSeen, markManySeen } = useNotifSeen(userId);

  const { data: notifRes } = useQuery({
    queryKey: queryKeys.notifications.summary(),
    queryFn: () => getSummary(),
    refetchInterval: 60_000,
    meta: { silent: true },
  });

  const summary = notifRes?.content ?? undefined;

  const visible = useMemo((): VisibleSummary => {
    const pendingIzin = (summary?.pendingIzin ?? []).filter(
      (item) => !isSeen("pendingIzin", item.id)
    );
    const belumAbsen = (summary?.belumAbsen ?? []).filter(
      (item) => !isSeen("belumAbsen", belumAbsenKey(item.id))
    );
    const endingSoon = (summary?.endingSoon ?? []).filter(
      (item) => !isSeen("endingSoon", endingSoonKey(item.id, item.tanggalSelesai))
    );

    return {
      pendingIzin,
      belumAbsen,
      endingSoon,
      counts: {
        pendingIzin: pendingIzin.length,
        belumAbsen: belumAbsen.length,
        endingSoon: endingSoon.length,
      },
      total: pendingIzin.length + belumAbsen.length + endingSoon.length,
      allKeys: [
        ...pendingIzin.map((item) => ({ kind: "pendingIzin" as const, key: item.id })),
        ...belumAbsen.map((item) => ({
          kind: "belumAbsen" as const,
          key: belumAbsenKey(item.id),
        })),
        ...endingSoon.map((item) => ({
          kind: "endingSoon" as const,
          key: endingSoonKey(item.id, item.tanggalSelesai),
        })),
      ],
    };
  }, [summary, isSeen]);

  const onMarkItem = (kind: NotifKind, key: string) => {
    markSeen(kind, key);
    setOpen(false);
  };

  const body = (
    <NotificationBody
      visible={visible}
      onMarkItem={onMarkItem}
      onMarkAll={visible.total > 0 ? () => markManySeen(visible.allKeys) : undefined}
    />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <NotifBellButton total={visible.total} />
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] gap-0 rounded-t-3xl border-[#E2E8EA] p-0 **:data-[slot=sheet-close]:top-5"
        >
          <div className="bg-muted mx-auto mt-3 h-1.5 w-10 rounded-full" />
          <SheetHeader className="border-b border-[#E2E8EA] px-4 pt-3 pb-3 text-left">
            <SheetTitle className="font-display text-lg">Perlu perhatian</SheetTitle>
            <SheetDescription>
              {visible.total > 0
                ? `${visible.total} item belum dilihat`
                : "Tidak ada alert saat ini"}
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-3 py-3">{body}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <NotifBellButton total={visible.total} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="w-[min(24rem,calc(100vw-1.5rem))] rounded-2xl border-[#E2E8EA] p-0 shadow-[0_12px_40px_rgba(15,76,92,0.12)]"
      >
        <div className="border-b border-[#E2E8EA] px-4 py-3">
          <p className="font-display text-sm font-semibold">Perlu perhatian</p>
          <p className="text-muted-foreground text-xs">
            {visible.total > 0
              ? `${visible.total} item belum dilihat`
              : "Tidak ada alert saat ini"}
          </p>
        </div>
        <div className="max-h-[min(28rem,70vh)] overflow-y-auto px-2 py-3">{body}</div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
