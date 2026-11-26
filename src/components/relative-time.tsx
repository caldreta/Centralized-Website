"use client";

import { useSyncExternalStore } from "react";

import { formatRelative } from "@/lib/pharmalink/format";

// A clock that ticks once a minute. The snapshot is the current minute, so it
// stays stable between renders; on the server it is null and nothing renders.
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(() => listeners.forEach((l) => l()), 30_000);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}
const currentMinute = () => Math.floor(Date.now() / 60_000) * 60_000;

export function RelativeTime({ iso, prefix = "Updated" }: { iso: string; prefix?: string }) {
  const now = useSyncExternalStore(subscribe, currentMinute, () => null);
  return (
    <time dateTime={iso} title={iso} className="text-xs text-muted-foreground tabular-nums">
      {now === null ? " " : `${prefix} ${formatRelative(iso, now)}`}
    </time>
  );
}
