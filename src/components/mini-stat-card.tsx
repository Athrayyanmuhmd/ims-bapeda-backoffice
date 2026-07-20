import { Icon } from "@iconify/react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/classname";

interface MiniStatCardProps {
  icon: string;
  label: string;
  value: string | number;
  accent?: "primary" | "green" | "orange" | "red";
  loading?: boolean;
}

const ACCENT_CLASS: Record<NonNullable<MiniStatCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  green: "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
};

export function MiniStatCard({ icon, label, value, accent = "primary", loading = false }: MiniStatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className={cn("flex size-9 items-center justify-center rounded-full", ACCENT_CLASS[accent])}>
          <Icon icon={icon} className="size-4.5" />
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{label}</p>
          {loading ? (
            <Skeleton className="mt-1.5 h-7 w-12" />
          ) : (
            <p className="font-display mt-0.5 text-2xl font-semibold tabular-nums">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
