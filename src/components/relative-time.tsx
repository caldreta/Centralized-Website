"use client";

import { useMinuteClock } from "@/hooks/use-minute-clock";
import { formatRelative } from "@/lib/pharmalink/format";

export function RelativeTime({ iso, prefix = "Updated" }: { iso: string; prefix?: string }) {
  const now = useMinuteClock();
  return (
    <time dateTime={iso} title={iso} className="text-xs text-muted-foreground tabular-nums">
      {now === null ? " " : `${prefix} ${formatRelative(iso, now)}`}
    </time>
  );
}
