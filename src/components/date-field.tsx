"use client";

import { Icon } from "@iconify/react";
import { cn } from "@/utils/classname";
import { fmtTanggalShort } from "@/utils/datetime";

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  /** Shown when empty — default Indonesian date mask. */
  emptyLabel?: string;
};

/**
 * iOS Safari paints empty `<input type="date">` as a blank box. We overlay a
 * visible hh/bb/tttt (or selected dd/MM/yyyy) and keep the native picker
 * transparent on top for the actual interaction.
 */
export function DateField({
  label,
  value,
  onChange,
  min,
  max,
  disabled,
  className,
  emptyLabel = "hh/bb/tttt",
}: DateFieldProps) {
  const display = value ? fmtTanggalShort(`${value}T00:00:00.000Z`) : null;

  return (
    <label className={cn("flex min-w-0 flex-1 flex-col gap-1", className)}>
      <span className="text-[11px] font-semibold tracking-wide text-[#5C6B72] uppercase">
        {label}
      </span>
      <div className="relative min-w-0">
        <div
          className={cn(
            "pointer-events-none flex h-10 w-full min-w-0 items-center gap-2 rounded-md border border-[#D7E2E5] bg-white px-3 text-sm",
            disabled && "opacity-60",
            display ? "text-[#1C2A30]" : "text-[#9AA4AA]"
          )}
        >
          <Icon icon="lucide:calendar" className="size-4 shrink-0 text-[#5C6B72]" />
          <span className="min-w-0 truncate tabular-nums">{display ?? emptyLabel}</span>
        </div>
        <input
          type="date"
          lang="id-ID"
          aria-label={label}
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </div>
    </label>
  );
}
