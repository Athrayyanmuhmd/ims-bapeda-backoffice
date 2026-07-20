import type { TNavigation } from "@/types/common";

export const NAVIGATION: TNavigation[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "material-symbols:dashboard-outline",
  },
  {
    name: "Peserta Magang",
    href: "/peserta-magang",
    icon: "mynaui:book-user",
  },
  {
    name: "Absensi",
    href: "/absensi",
    icon: "mdi:clock-edit-outline",
  },
  {
    name: "Jurnal",
    href: "/jurnal",
    icon: "mdi:notebook-outline",
  },
  {
    name: "Penilaian",
    href: "/penilaian",
    icon: "mdi:star-outline",
  },
  {
    name: "Dokumen",
    href: "/dokumen",
    icon: "mdi:file-document-outline",
  },
  {
    name: "Manajemen User",
    href: "/manajemen-user",
    icon: "tabler:replace-user",
    roles: ["Admin"],
  },
  {
    name: "Manajemen Divisi",
    href: "/manajemen-divisi",
    icon: "mingcute:department-line",
    roles: ["Admin"],
  },
  {
    name: "Manajemen Instansi",
    href: "/manajemen-instansi",
    icon: "mdi:school-outline",
    roles: ["Admin"],
  },
  {
    name: "Manajemen Role",
    href: "/manajemen-role",
    icon: "eos-icons:role-binding-outlined",
    roles: ["Admin"],
  },
];
