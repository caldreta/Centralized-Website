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
      className={cn("relative isolate overflow-hidden rounded-2xl border bg-muted shadow-[0_1px_3px_rgb(15_40_40/0.05)]", className)}
      role="region"
      aria-label="Map of pharmacies"
    >
      <PharmacyMapInner {...props} />
    </div>
  );
}
