"use client";

import { useSyncExternalStore } from "react";

// A clock that ticks once a minute, shared by every component that shows
// time-dependent text ("Updated 5 min ago", "Open now"). The snapshot is the
// current minute, so it is stable between renders. On the server it is null,
// so nothing time-dependent is rendered there (no hydration mismatch).

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

/** Milliseconds at the start of the current minute, or null while rendering on the server. */
export function useMinuteClock(): number | null {
  return useSyncExternalStore(subscribe, currentMinute, () => null);
}
