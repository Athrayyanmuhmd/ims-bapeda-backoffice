import { Loader2Icon } from "lucide-react";

import { cn } from "@/utils/classname";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <output aria-label="Loading" className="inline-flex leading-none">
      <Loader2Icon className={cn("size-4 animate-spin", className)} {...props} />
    </output>
  );
}

export { Spinner };
