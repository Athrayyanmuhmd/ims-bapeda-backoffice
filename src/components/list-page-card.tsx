import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/classname";

type ListPageCardProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

/** Shared surface for CRUD list pages — keeps spacing and border consistent. */
export function ListPageCard({ children, className, contentClassName }: ListPageCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-[#E2E8EA] bg-white shadow-[0_1px_2px_rgba(15,76,92,0.04)]",
        "before:bg-primary relative before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']",
        className
      )}
    >
      <CardContent className={cn("flex flex-col gap-4 pt-6 pl-7", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
