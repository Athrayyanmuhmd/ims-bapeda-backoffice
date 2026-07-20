"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/stores/auth";

interface RequireRoleProps {
  role: string;
  children: React.ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { user } = useAuth();

  if (user?.role !== role) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
        <Icon icon="mdi:lock-outline" className="text-muted-foreground size-10" />
        <div>
          <p className="font-semibold">Akses terbatas</p>
          <p className="text-muted-foreground text-sm">
            Halaman ini hanya bisa diakses oleh role {role}.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">Kembali ke Dashboard</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
