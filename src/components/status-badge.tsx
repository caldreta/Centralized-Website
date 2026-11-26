import { CircleCheck, CircleX } from "lucide-react";

import { STATUS_LABEL } from "@/lib/pharmalink/format";
import type { StockStatus } from "@/lib/pharmalink/types";
import { cn } from "@/lib/utils";

const STYLES: Record<StockStatus, string> = {
  in_stock: "bg-status-in/12 text-status-in-text",
  out_of_stock: "bg-muted text-muted-foreground",
};

const ICONS = {
  in_stock: CircleCheck,
  out_of_stock: CircleX,
} as const;

/** Status uses colour, an icon and a word, so it never relies on colour alone. */
export function StatusBadge({
  status,
  size = "sm",
  className,
}: {
  status: StockStatus;
  size?: "sm" | "md";
  className?: string;
}) {
  const Icon = ICONS[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full font-medium",
        size === "md" ? "px-2.5 py-1 text-sm" : "px-2 py-0.5 text-xs",
        STYLES[status],
        className,
      )}
    >
      <Icon aria-hidden="true" className={size === "md" ? "size-4" : "size-3.5"} />
      {STATUS_LABEL[status]}
    </span>
  );
}
