"use client";

import { List, Map as MapIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export type ListMapView = "list" | "map";

/**
 * Desktop: list and map side by side.
 * Phone: one at a time, with a List / Map switch, so results are never
 * pushed below a map.
 */
export function ListMapLayout({
  view,
  onViewChange,
  list,
  map,
}: {
  view: ListMapView;
  onViewChange: (view: ListMapView) => void;
  list: ReactNode;
  map: ReactNode;
}) {
  // When the view switches (e.g. "See on map" from a card far down the list),
  // bring the List / Map switch back into view so the map isn't half off-screen.
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = rootRef.current;
    if (el && el.getBoundingClientRect().top < 64) {
      el.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, [view]);

  return (
    <div ref={rootRef} className="scroll-mt-20 space-y-4">
      <div
        role="group"
        aria-label="Show results as"
        className="grid grid-cols-2 gap-1 rounded-full border bg-card p-1 lg:hidden"
      >
        {(
          [
            ["list", "List", List],
            ["map", "Map", MapIcon],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => onViewChange(value)}
            className={cn(
              "flex h-9 items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors",
              view === value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className={cn(view === "map" && "hidden", "lg:block")}>{list}</div>
        <div className={cn(view === "list" && "hidden", "lg:block")}>
          <div className="h-[calc(100dvh-15rem)] min-h-80 lg:sticky lg:top-24 lg:h-[calc(100dvh-8rem)]">
            {map}
          </div>
        </div>
      </div>
    </div>
  );
}
