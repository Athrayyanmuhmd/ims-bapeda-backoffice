export const STATUS_MAGANG_BADGE_CLASS: Record<string, string> = {
  AKTIF: "text-[#1B6B4A] bg-[#E8F3EE]",
  SELESAI: "text-[#2F4F8A] bg-[#E8EEF8]",
  BERHENTI: "text-[#A33B3B] bg-[#FCEAEA]",
};

export const KEHADIRAN_BADGE_CLASS: Record<string, string> = {
  Hadir: "text-[#1B6B4A] bg-[#E8F3EE]",
  Sakit: "text-[#B85C1A] bg-[#FFF1E6]",
  Izin: "text-[#2F4F8A] bg-[#E8EEF8]",
  Alpa: "text-[#A33B3B] bg-[#FCEAEA]",
};

export const IZIN_STATUS_BADGE_CLASS: Record<string, string> = {
  PENDING: "text-[#8A6A12] bg-[#FFF6DB]",
  APPROVED: "text-[#2F4F8A] bg-[#E8EEF8]",
  REJECTED: "text-[#A33B3B] bg-[#FCEAEA]",
};

/** Shared sizing for table / list status chips. */
export const BADGE_SIZE_CLASS =
  "inline-flex h-6 min-w-[5.5rem] items-center justify-center rounded-md px-2.5 text-xs font-semibold leading-none whitespace-nowrap";
