"use client";

import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { ListMapLayout, type ListMapView } from "@/components/list-map-layout";
import { LocationButton } from "@/components/location-button";
import { PharmacyMap } from "@/components/map/pharmacy-map";
import type { MapPoint } from "@/components/map/types";
import { OpenStatus } from "@/components/opening-hours";
import { PharmacyActions } from "@/components/pharmacy-actions";
import { PopularSearches } from "@/components/popular-searches";
import { RelativeTime } from "@/components/relative-time";
import { RxTag } from "@/components/rx-tag";
import { StatusBadge } from "@/components/status-badge";
import { useUserLocation } from "@/hooks/use-user-location";
import {
  distanceKm,
  formatDistance,
  isAvailable,
  medicineDetail,
  medicineLabel,
} from "@/lib/pharmalink/format";
import type { PharmacySearchResult } from "@/lib/pharmalink/types";
import { cn } from "@/lib/utils";

export function SearchResults({
  query,
  results,
}: {
  query: string;
  results: PharmacySearchResult[];
}) {
  const { position } = useUserLocation();
  const [showOut, setShowOut] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<ListMapView>("list");

  const availableCount = results.filter((r) => isAvailable(r.best_status)).length;
  const outCount = results.length - availableCount;

  const rows = useMemo(() => {
    const visible = results
      .filter((r) => showOut || isAvailable(r.best_status))
      .map((r) => ({
        ...r,
        matches: showOut ? r.matches : r.matches.filter((m) => isAvailable(m.stock_status)),
        distance: position ? distanceKm(position, r.pharmacy) : null,
      }));
    if (position) {
      visible.sort(
        (a, b) =>
          Number(!isAvailable(a.best_status)) - Number(!isAvailable(b.best_status)) ||
          a.distance! - b.distance!,
      );
    }
    return visible;
  }, [results, showOut, position]);

  const points: MapPoint[] = useMemo(
    () =>
      rows.map((r, i) => ({
        id: r.pharmacy.id,
        name: r.pharmacy.name,
        latitude: r.pharmacy.latitude,
        longitude: r.pharmacy.longitude,
        status: r.best_status,
        label: String(i + 1),
        popupDetail: r.pharmacy.address,
        href: `/pharmacies/${r.pharmacy.id}?from=${encodeURIComponent(query)}`,
      })),
    [rows, query],
  );

  const showOnMap = useCallback((id: string) => {
    setSelectedId(id);
    setView("map");
  }, []);

  if (results.length === 0) {
    return (
      <div className="space-y-4 rounded-2xl border border-dashed bg-card/60 p-8 text-center">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">No pharmacy lists “{query}” yet</h1>
          <p className="text-sm text-muted-foreground">
            Check the spelling, or try the generic name (for example “Paracetamol” instead of a
            brand).
          </p>
        </div>
        <PopularSearches className="justify-center" />
        <Link href="/pharmacies" className="inline-flex text-sm font-medium text-primary hover:underline">
          Browse all pharmacies instead
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Where to find “{query}”
          </h1>
          <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
            {availableCount > 0 ? (
              <>
                <strong className="text-foreground">{availableCount}</strong>{" "}
                {availableCount === 1 ? "pharmacy has" : "pharmacies have"} it available
                {position ? ", nearest first" : ""}
              </>
            ) : (
              <>Listed at {outCount} {outCount === 1 ? "pharmacy" : "pharmacies"}, but out of stock everywhere right now.</>
            )}
          </p>
        </div>
        <LocationButton />
      </header>

      <ListMapLayout
        view={view}
        onViewChange={setView}
        list={
          <div className="space-y-3">
            {outCount > 0 && (
              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showOut}
                  onChange={(e) => setShowOut(e.target.checked)}
                  className="size-4 accent-primary"
                />
                Also show {outCount} {outCount === 1 ? "pharmacy" : "pharmacies"} where it’s out of
                stock
              </label>
            )}

            <ol className="space-y-3">
              {rows.map((row, index) => {
                const detailsHref = `/pharmacies/${row.pharmacy.id}?from=${encodeURIComponent(query)}`;
                return (
                  <li key={row.pharmacy.id}>
                    <article
                      className={cn(
                        "rounded-2xl border bg-card p-4 shadow-[0_1px_3px_rgb(15_40_40/0.04)] transition-shadow sm:p-5",
                        selectedId === row.pharmacy.id && "ring-2 ring-primary/35",
                        !isAvailable(row.best_status) && "opacity-80",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(row.pharmacy.id)}
                          aria-label={`Highlight ${row.pharmacy.name} on the map`}
                          className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          {index + 1}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                            <h2 className="text-base leading-snug font-semibold">
                              <Link href={detailsHref} className="hover:text-primary hover:underline">
                                {row.pharmacy.name}
                              </Link>
                            </h2>
                            <StatusBadge status={row.best_status} size="md" />
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{row.pharmacy.address}</p>
                          <OpenStatus hours={row.pharmacy.hours} className="mt-1" />
                          {row.distance !== null && (
                            <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium">
                              <MapPin className="size-3.5 text-primary" aria-hidden="true" />
                              {formatDistance(row.distance)} away
                            </p>
                          )}
                        </div>
                      </div>

                      <ul className="mt-4 divide-y divide-border/60 rounded-xl bg-muted/60">
                        {row.matches.map((m) => (
                          <li
                            key={m.key}
                            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3.5 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium">
                                {medicineLabel(m)}
                                {m.category === "prescription" && <RxTag />}
                              </p>
                              <p className="text-xs text-muted-foreground">{medicineDetail(m)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                              <StatusBadge status={m.stock_status} />
                              <RelativeTime iso={m.updated_at} />
                            </div>
                          </li>
                        ))}
                      </ul>

                      <PharmacyActions pharmacy={row.pharmacy} className="mt-4" />

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                        <Link
                          href={detailsHref}
                          className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
                        >
                          View all medicines here <ChevronRight className="size-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => showOnMap(row.pharmacy.id)}
                          className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground lg:hidden"
                        >
                          <MapPin className="size-4" /> See on map
                        </button>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          </div>
        }
        map={
          <PharmacyMap
            points={points}
            user={position}
            selectedId={selectedId}
            onSelect={setSelectedId}
            className="size-full"
          />
        }
      />
    </div>
  );
}
