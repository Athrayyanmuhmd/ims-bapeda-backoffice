"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/utils/classname";

type ListToolbarProps = {
  searchPlaceholder: string;
  onSearch: (value: string) => void;
  defaultSearchValue?: string;
  action?: ReactNode;
  className?: string;
};

export function ListToolbar({
  searchPlaceholder,
  onSearch,
  defaultSearchValue,
  action,
  className,
}: ListToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-[#E8EEF0] bg-[#F7FAFB] p-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <InputGroup className="w-full border-[#D7E2E5] bg-white sm:max-w-sm">
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
      {action}
    </div>
  );
}
