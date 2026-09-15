"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";
import { columns } from "./columns";

export default function TableAttendance() {
  // Shares the query key/params with the other dashboard widgets so this reuses the cached fetch.
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.absensi.recent(),
    queryFn: () =>
      services.absensi.getAllAbsensi({ rows: 100, orderKey: "tanggal", orderRule: "desc" }),
  });

  const entries = (data?.content?.entries ?? []).slice(0, 8);

  return (
    <Card className="relative h-full overflow-hidden border-[#E2E8EA] shadow-[0_1px_2px_rgba(15,76,92,0.04)] before:bg-primary before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']">
      <CardHeader className="pl-7">
        <CardTitle>Absensi Terbaru</CardTitle>
        <CardAction>
          <Link href="/absensi" className="text-primary text-sm font-medium hover:underline">
            Lihat semua
          </Link>
        </CardAction>
        <p className="text-muted-foreground text-sm">
          Catatan kehadiran peserta magang paling baru
        </p>
      </CardHeader>
      <CardContent className="flex-1 pl-7">
        <DataTable data={entries} columns={columns} loading={isLoading} hideFooter />
      </CardContent>
    </Card>
  );
}
