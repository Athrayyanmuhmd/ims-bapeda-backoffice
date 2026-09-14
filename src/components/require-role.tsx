"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/stores/auth";

// Named `allowedRole` rather than `role`: a prop called `role` on a component
// is indistinguishable from the ARIA `role` attribute to both readers and
// linters (biome flagged every usage as an invalid ARIA role).
interface RequireRoleProps {
  allowedRole: string;
  children: React.ReactNode;
}

export function RequireRole({ allowedRole, children }: RequireRoleProps) {
  const { user } = useAuth();

  if (user?.role !== allowedRole) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
        <Icon icon="mdi:lock-outline" className="text-muted-foreground size-10" />
        <div>
          <p className="font-semibold">Akses terbatas</p>
          <p className="text-muted-foreground text-sm">
            Halaman ini hanya bisa diakses oleh role {allowedRole}.
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
