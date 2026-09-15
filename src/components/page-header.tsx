import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { cn } from "@/utils/classname";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-[#E2E8EA] bg-white p-4 shadow-[0_1px_2px_rgba(15,76,92,0.04)] sm:flex-row sm:items-center sm:justify-between sm:p-5",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
        {icon ? (
          <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl sm:size-12">
            <Icon icon={icon} className="size-5 sm:size-6" />
          </div>
        ) : null}
        <div className="min-w-0 space-y-1">
          {eyebrow ? (
            <p className="text-primary text-[11px] font-semibold tracking-[0.14em] uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-display text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
