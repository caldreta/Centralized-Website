"use client";

import { useSyncExternalStore } from "react";

import type { LatLng } from "@/components/map/types";

export type LocationState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "ready"; position: LatLng }
  | { status: "denied" }
  | { status: "unavailable" };

// One shared store, so the location the visitor allowed on one page is reused
// on the next page without asking again (kept in memory only, never sent anywhere).
let state: LocationState = { status: "idle" };
const listeners = new Set<() => void>();
const IDLE: LocationState = { status: "idle" };

function set(next: LocationState) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function requestLocation() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    set({ status: "unavailable" });
    return;
  }
  set({ status: "locating" });
  navigator.geolocation.getCurrentPosition(
    (pos) =>
      set({
        status: "ready",
        position: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
      }),
    (err) => set({ status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable" }),
    { enableHighAccuracy: false, timeout: 15_000, maximumAge: 5 * 60_000 },
  );
}

export function useUserLocation() {
  const location = useSyncExternalStore(subscribe, () => state, () => IDLE);
  const position = location.status === "ready" ? location.position : null;
  return { location, position, requestLocation };
}
