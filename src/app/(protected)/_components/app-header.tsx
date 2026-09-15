"use client";

import { Icon } from "@iconify/react";
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
import { useAuth } from "@/stores/auth";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./notification-bell";
import DialogEditProfile from "./partials/dialog-edit-profile";
import DialogLogout from "./partials/dialog-logout";

export default function AppHeader() {
  const { user } = useAuth();
  const pathname = usePathname();
  const logoutDialogRef = useRef<IModalRef>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

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
      <header
        data-print-hide
        className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-[#E2E8EA] bg-white/95 px-3 backdrop-blur sm:h-16 sm:gap-4 sm:px-4"
      >
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
          <NotificationBell />

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
                onClick={() => setEditProfileOpen(true)}
              >
                <Icon icon="mdi:account-edit-outline" className="size-4" />
                <span>Edit Profil</span>
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
      <DialogEditProfile open={editProfileOpen} onOpenChange={setEditProfileOpen} />
    </>
  );
}
