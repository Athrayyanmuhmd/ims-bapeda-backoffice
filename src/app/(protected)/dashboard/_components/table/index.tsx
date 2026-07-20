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
    <Card>
      <CardHeader>
        <CardTitle>Absensi Terbaru</CardTitle>
        <CardAction>
          <Link href="/absensi" className="text-primary text-sm font-medium hover:underline">
            Lihat semua
          </Link>
        </CardAction>
        <p className="text-muted-foreground text-sm">Catatan kehadiran peserta magang paling baru</p>
      </CardHeader>
      <CardContent>
        <DataTable data={entries} columns={columns} loading={isLoading} hideFooter />
      </CardContent>
    </Card>
  );
}
