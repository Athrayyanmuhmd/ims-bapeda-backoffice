"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAVIGATION } from "@/constants/navigation";
import { useAuth } from "@/stores/auth";
import { cn } from "@/utils/classname";

const OPS_HREFS = new Set([
  "/dashboard",
  "/peserta-magang",
  "/absensi",
  "/logbook",
  "/penilaian",
  "/dokumen",
]);

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { setOpenMobile, state } = useSidebar();

  const visible = NAVIGATION.filter(
    (item) => !item.roles || item.roles.includes(user?.role ?? "")
  );
  const operasional = visible.filter((item) => OPS_HREFS.has(item.href));
  const administrasi = visible.filter((item) => !OPS_HREFS.has(item.href));

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  const renderItems = (items: typeof visible) =>
    items.map((item) => {
      const active = isActive(item.href);
      return (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={active}
            tooltip={item.name}
            className={cn(
              "relative h-10 rounded-xl px-3 transition-all duration-200",
              "hover:bg-white/10",
              active &&
                "bg-white/15 shadow-[inset_3px_0_0_0_#6fb8e3] data-[active=true]:bg-white/15 data-[active=true]:font-semibold"
            )}
          >
            <Link href={item.href} onClick={() => setOpenMobile(false)}>
              {item.icon ? (
                <Icon
                  icon={item.icon}
                  className={cn("size-4 shrink-0", active ? "text-[#9fd0ea]" : "opacity-80")}
                />
              ) : null}
              <span>{item.name}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/5 bg-[linear-gradient(180deg,#0f445c_0%,#0d3b52_45%,#0a3246_100%)]"
    >
      <SidebarHeader className="gap-3 px-3 pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="SIMAGANG Bapeda"
              className="h-auto rounded-2xl bg-white/5 px-2.5 py-2.5 ring-1 ring-white/10 hover:bg-white/10 data-[active=true]:bg-white/5"
            >
              <Link href="/dashboard" onClick={() => setOpenMobile(false)}>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={320}
                    height={180}
                    className="size-6 object-contain"
                  />
                </div>
                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="font-display truncate text-[15px] font-semibold tracking-tight">
                    SIMAGANG
                  </span>
                  <span className="truncate text-[11px] font-medium tracking-[0.12em] text-white/55 uppercase">
                    Bapeda
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup className="py-2">
          <SidebarGroupLabel className="px-3 text-[10px] tracking-[0.16em] text-white/45">
            Operasional
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">{renderItems(operasional)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {administrasi.length > 0 ? (
          <>
            <SidebarSeparator className="mx-3 bg-white/10" />
            <SidebarGroup className="py-2">
              <SidebarGroupLabel className="px-3 text-[10px] tracking-[0.16em] text-white/45">
                Administrasi
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">{renderItems(administrasi)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="px-3 pb-3">
        <div
          className={cn(
            "rounded-2xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10",
            state === "collapsed" && "px-1.5"
          )}
        >
          {state === "collapsed" ? (
            <div className="text-primary flex size-8 items-center justify-center rounded-xl bg-white/10 text-xs font-semibold">
              {(user?.fullName ?? "U").slice(0, 1).toUpperCase()}
            </div>
          ) : (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user?.fullName ?? "Pengguna"}</p>
              <p className="truncate text-[11px] text-white/50">{user?.role ?? "Staff"}</p>
            </div>
          )}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
