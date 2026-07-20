"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NAVIGATION } from "@/constants/navigation";
import { useAuth } from "@/stores/auth";

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="IMS Bapeda Backoffice">
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-white">
                  <Image src="/logo.png" alt="Logo" width={32} height={32} className="size-4.5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-display truncate font-semibold tracking-tight">IMS Bapeda</span>
                  <span className="text-sidebar-foreground/60 truncate text-xs">Backoffice</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAVIGATION.filter((item) => !item.roles || item.roles.includes(user?.role ?? "")).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.name}>
                    <Link href={item.href}>
                      {item.icon && <Icon icon={item.icon} className="size-4" />}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
