"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/utils/classname";

type ListToolbarProps = {
  searchPlaceholder: string;
  onSearch: (value: string) => void;
  defaultSearchValue?: string;
  filters?: ReactNode;
  /** Secondary controls (e.g. export date range) — full-width row under filters */
  extras?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function ListToolbar({
  searchPlaceholder,
  onSearch,
  defaultSearchValue,
  filters,
  extras,
  action,
  className,
}: ListToolbarProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2.5 overflow-hidden rounded-xl border border-[#E8EEF0] bg-[#F7FAFB] p-3",
        className
      )}
    >
      <div
        className={cn(
          "grid min-w-0 grid-cols-1 gap-2",
          filters ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "sm:max-w-sm"
        )}
      >
        <InputGroup className="h-9 w-full border-[#D7E2E5] bg-white">
          <InputGroupInput
            placeholder={searchPlaceholder}
            defaultValue={defaultSearchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="bg-transparent"
          />
          <InputGroupAddon align="inline-start">
            <Icon icon="lucide:search" className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
        {filters}
      </div>

      {(extras || action) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          {extras ? <div className="min-w-0 flex-1">{extras}</div> : null}
          {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
        </div>
      )}
    </div>
  );
}
