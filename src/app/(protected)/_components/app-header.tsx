"use client";

import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import type { IModalRef } from "@/components/modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NAVIGATION } from "@/constants/navigation";
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";
import { useAuth } from "@/stores/auth";
import { fmtTanggal } from "@/utils/datetime";
import DialogChangePassword from "./partials/dialog-change-password";
import DialogLogout from "./partials/dialog-logout";

export default function AppHeader() {
  const { user } = useAuth();
  const pathname = usePathname();
  const logoutDialogRef = useRef<IModalRef>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const { data: notifRes } = useQuery({
    queryKey: queryKeys.notifications.summary(),
    queryFn: () => services.notifications.getSummary(),
    refetchInterval: 60_000,
  });

  const summary = notifRes?.content;
  const totalAlerts =
    (summary?.counts.pendingIzin ?? 0) +
    (summary?.counts.belumAbsen ?? 0) +
    (summary?.counts.endingSoon ?? 0);

  const pageTitle =
    NAVIGATION.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
      ?.name ?? "SIMAGANG Bapeda";

  const getUserInitials = () => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-[#E2E8EA] bg-white/95 px-3 backdrop-blur sm:h-16 sm:gap-4 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="min-w-0 flex-1">
            <p className="text-primary/70 text-[10px] font-semibold tracking-[0.14em] uppercase">
              SIMAGANG
            </p>
            <h1 className="font-display truncate text-base font-semibold tracking-tight sm:text-lg">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Icon icon="mdi:bell-outline" className="size-5" />
                {totalAlerts > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                    {totalAlerts > 99 ? "99+" : totalAlerts}
                  </span>
                )}
                <span className="sr-only">Notifikasi</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
              <DropdownMenuLabel>Perlu perhatian</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {(summary?.pendingIzin.length ?? 0) > 0 && (
                <>
                  <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
                    Izin menunggu ({summary?.counts.pendingIzin})
                  </DropdownMenuLabel>
                  {summary?.pendingIzin.slice(0, 4).map((item) => (
                    <DropdownMenuItem key={item.id} asChild>
                      <Link href="/absensi" className="flex flex-col items-start gap-0.5">
                        <span className="font-medium">
                          {item.name} · {item.jenis}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {fmtTanggal(item.tanggal)}
                          {item.divisi ? ` · ${item.divisi}` : ""}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              {(summary?.belumAbsen.length ?? 0) > 0 && (
                <>
                  <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
                    Belum absen hari ini ({summary?.counts.belumAbsen})
                  </DropdownMenuLabel>
                  {summary?.belumAbsen.slice(0, 4).map((item) => (
                    <DropdownMenuItem key={item.id} asChild>
                      <Link href="/absensi" className="flex flex-col items-start gap-0.5">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground text-xs">{item.divisi ?? "-"}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}

              {(summary?.endingSoon.length ?? 0) > 0 && (
                <>
                  <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
                    Magang segera berakhir ({summary?.counts.endingSoon})
                  </DropdownMenuLabel>
                  {summary?.endingSoon.slice(0, 4).map((item) => (
                    <DropdownMenuItem key={item.id} asChild>
                      <Link
                        href={`/peserta-magang/${item.id}`}
                        className="flex flex-col items-start gap-0.5"
                      >
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {item.daysLeft < 0
                            ? `Lewat ${Math.abs(item.daysLeft)} hari`
                            : item.daysLeft === 0
                              ? "Berakhir hari ini"
                              : `${item.daysLeft} hari lagi`}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              {totalAlerts === 0 && (
                <div className="text-muted-foreground px-2 py-4 text-center text-sm">
                  Tidak ada notifikasi.
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative size-8 rounded-full">
                <Avatar className="size-8">
                  <AvatarImage alt={user?.fullName || "User"} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.fullName || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="inline-flex w-full cursor-pointer items-center gap-2"
                onClick={() => setChangePasswordOpen(true)}
              >
                <Icon icon="mdi:key-outline" className="size-4" />
                <span>Ganti Password</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={() => logoutDialogRef.current?.open()}>
            <Icon icon="mdi:logout" className="size-5" />
            <span className="sr-only">Keluar</span>
          </Button>
        </div>
      </header>
      <DialogLogout dialogRef={logoutDialogRef} />
      <DialogChangePassword open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </>
  );
}
