"use client";

import { useQuery } from "@tanstack/react-query";
import { SingleSelect } from "@/components/single-select";
import { queryKeys } from "@/constants/query-keys";
import { services } from "@/services";
import { KEHADIRAN_OPTIONS } from "@/services/absensi/types";
import { STATUS_MAGANG_OPTIONS } from "@/services/peserta-magang/types";
import { useAuth } from "@/stores/auth";
import { cn } from "@/utils/classname";

const STATUS_LABEL: Record<(typeof STATUS_MAGANG_OPTIONS)[number], string> = {
  AKTIF: "Aktif",
  SELESAI: "Selesai",
  BERHENTI: "Berhenti",
};

const triggerClass = "h-9 w-full border-[#D7E2E5] bg-white";

type ListFiltersProps = {
  values?: Record<string, string | number | boolean>;
  onChange: (key: string, value: string | null) => void;
  showKehadiran?: boolean;
  showStatus?: boolean;
  className?: string;
};

export function ListFilters({
  values,
  onChange,
  showKehadiran = false,
  showStatus = false,
  className,
}: ListFiltersProps) {
  const role = useAuth((s) => s.user?.role);
  const showPembimbing = role === "Admin";

  const { data: divisiData } = useQuery({
    queryKey: queryKeys.divisi.options(),
    queryFn: () => services.divisi.getAllDivisi({ rows: 100 }),
  });

  const { data: instansiData } = useQuery({
    queryKey: queryKeys.instansi.options(),
    queryFn: () => services.instansi.getAllInstansi({ rows: 100 }),
  });

  const { data: userData } = useQuery({
    queryKey: queryKeys.user.options(),
    queryFn: () => services.user.getAllUser({ rows: 100 }),
    enabled: showPembimbing,
  });

  const divisiOptions = (divisiData?.content?.entries ?? []).map((d) => ({
    label: d.name,
    value: d.id,
  }));
  const instansiOptions = (instansiData?.content?.entries ?? []).map((i) => ({
    label: i.nama,
    value: i.id,
  }));
  const pembimbingOptions = (userData?.content?.entries ?? [])
    .filter((u) => u.role === "Pembimbing" && u.status === "active")
    .map((u) => ({
      label: u.fullName,
      value: u.id,
    }));

  const kehadiranOptions = KEHADIRAN_OPTIONS.map((v) => ({ label: v, value: v }));
  const statusOptions = STATUS_MAGANG_OPTIONS.map((v) => ({
    label: STATUS_LABEL[v],
    value: v,
  }));

  const asString = (key: string) => {
    const value = values?.[key];
    return typeof value === "string" ? value : null;
  };

  return (
    <div className={cn("contents", className)}>
      <SingleSelect
        options={divisiOptions}
        value={asString("divisiId")}
        onChange={(value) => onChange("divisiId", value)}
        placeholder="Divisi"
        allOption={{ label: "Semua Divisi", value: "all" }}
        triggerClassName={triggerClass}
      />
      <SingleSelect
        options={instansiOptions}
        value={asString("instansiId")}
        onChange={(value) => onChange("instansiId", value)}
        placeholder="Univ/Instansi"
        allOption={{ label: "Semua Instansi", value: "all" }}
        triggerClassName={triggerClass}
      />
      {showKehadiran && (
        <SingleSelect
          options={kehadiranOptions}
          value={asString("kehadiran")}
          onChange={(value) => onChange("kehadiran", value)}
          placeholder="Kehadiran"
          allOption={{ label: "Semua Kehadiran", value: "all" }}
          triggerClassName={triggerClass}
        />
      )}
      {showStatus && (
        <SingleSelect
          options={statusOptions}
          value={asString("status")}
          onChange={(value) => onChange("status", value)}
          placeholder="Status"
          allOption={{ label: "Semua Status", value: "all" }}
          triggerClassName={triggerClass}
        />
      )}
      {showPembimbing && (
        <SingleSelect
          options={pembimbingOptions}
          value={asString("pembimbingLapanganId")}
          onChange={(value) => onChange("pembimbingLapanganId", value)}
          placeholder="Pembimbing"
          allOption={{ label: "Semua Pembimbing", value: "all" }}
          triggerClassName={triggerClass}
        />
      )}
    </div>
  );
}
