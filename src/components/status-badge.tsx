import { cn } from "@/utils/classname";

/** Fixed footprint so labels like "15 hari lagi" and "Lewat 15 hari" align. */
export const BADGE_BASE =
  "inline-flex h-6 min-w-[6.75rem] items-center justify-center rounded-md px-2.5 text-center text-xs font-semibold leading-none whitespace-nowrap";

type StatusBadgeProps = {
  label: string;
  className?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "primary";
};

const TONE_CLASS: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  neutral: "bg-[#EEF2F3] text-[#5C6B72]",
  success: "bg-[#E8F3EE] text-[#1B6B4A]",
  warning: "bg-[#FFF1E6] text-[#B85C1A]",
  danger: "bg-[#FCEAEA] text-[#A33B3B]",
  info: "bg-[#E8EEF8] text-[#2F4F8A]",
  primary: "bg-[#E7F1F6] text-[#175e86]",
};

export function StatusBadge({ label, className, tone = "neutral" }: StatusBadgeProps) {
  return <span className={cn(BADGE_BASE, TONE_CLASS[tone], className)}>{label}</span>;
}
