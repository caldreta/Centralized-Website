import { STATUS_LABEL } from "@/lib/pharmalink/format";
import type { StockStatus } from "@/lib/pharmalink/types";
import { cn } from "@/lib/utils";

const STYLES: Record<StockStatus, string> = {
  in_stock: "bg-status-in/12 text-status-in ring-status-in/30",
  low_stock: "bg-status-low/15 text-[oklch(0.5_0.13_60)] ring-status-low/40",
  out_of_stock: "bg-status-out/12 text-muted-foreground ring-status-out/30",
};

export function StatusBadge({ status, className }: { status: StockStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          status === "in_stock" && "bg-status-in",
          status === "low_stock" && "bg-status-low",
          status === "out_of_stock" && "bg-status-out",
        )}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}
