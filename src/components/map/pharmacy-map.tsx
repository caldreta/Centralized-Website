"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { PharmacyMapProps } from "./types";

// Leaflet touches `window` on import, so it only loads in the browser.
const PharmacyMapInner = dynamic(() => import("./pharmacy-map-inner"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

export function PharmacyMap({
  className,
  ...props
}: PharmacyMapProps & { className?: string }) {
  return (
    <div
      className={cn("relative isolate overflow-hidden rounded-xl border bg-muted", className)}
      role="region"
      aria-label="Map of pharmacies"
    >
      <PharmacyMapInner {...props} />
    </div>
  );
}
