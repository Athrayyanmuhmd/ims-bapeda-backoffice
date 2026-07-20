"use client";

import { useFieldId } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TOption } from "@/types/common";
import { cn } from "@/utils/classname";

interface SingleSelectProps {
  options: TOption[];
  value?: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  allOption?: TOption;
}

export function SingleSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className,
  triggerClassName,
  allOption,
}: SingleSelectProps) {
  const allValue = allOption?.value ?? "all";
  const fieldId = useFieldId();

  const handleChange = (selectedValue: string) => {
    if (allOption && selectedValue === allValue) {
      onChange(null);
    } else {
      onChange(selectedValue);
    }
  };

  return (
    <Select
      name={fieldId}
      value={value ?? (allOption ? allValue : undefined)}
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-full", triggerClassName, className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allOption && <SelectItem value={allValue}>{allOption.label}</SelectItem>}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
