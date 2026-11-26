"use client";

import { MapPin, Navigation, Phone } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { LocationButton } from "@/components/location-button";
import { PharmacyMap } from "@/components/map/pharmacy-map";
import type { MapPoint } from "@/components/map/types";
import { RelativeTime } from "@/components/relative-time";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { useUserLocation } from "@/hooks/use-user-location";
import {
  directionsUrl,
  distanceKm,
  formatDistance,
  isAvailable,
  medicineDetail,
  medicineLabel,
  telHref,
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
        href: `/pharmacies/${r.pharmacy.id}`,
      })),
    [rows],
  );

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="font-medium">No participating pharmacy lists “{query}”.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Check the spelling, try the generic name (e.g. “Paracetamol” instead of a brand), or
          search a shorter part of the name.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="order-2 space-y-4 lg:order-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm" aria-live="polite">
            {availableCount > 0 ? (
              <>
                <strong>{availableCount}</strong>{" "}
                {availableCount === 1 ? "pharmacy has" : "pharmacies have"} “{query}” available
              </>
            ) : (
              <>
                “{query}” is listed at {outCount} {outCount === 1 ? "pharmacy" : "pharmacies"} but
                is <strong>out of stock</strong> everywhere right now.
              </>
            )}
          </p>
          <LocationButton />
        </div>

        {outCount > 0 && (
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={showOut}
              onChange={(e) => setShowOut(e.target.checked)}
              className="size-4 accent-primary"
            />
            Also show {outCount} {outCount === 1 ? "pharmacy" : "pharmacies"} where it is out of
            stock
          </label>
        )}

        <ol className="space-y-3">
          {rows.map((row, index) => (
            <li key={row.pharmacy.id}>
              <article
                className={cn(
                  "rounded-xl border bg-card p-4 transition-shadow",
                  selectedId === row.pharmacy.id && "ring-2 ring-primary/40",
                  !isAvailable(row.best_status) && "opacity-75",
                )}
              >
                <header className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold leading-tight">
                      <Link href={`/pharmacies/${row.pharmacy.id}`} className="hover:underline">
                        {row.pharmacy.name}
                      </Link>
                    </h2>
                    <p className="mt-0.5 flex items-start gap-1 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        {row.pharmacy.address}
                        {row.distance !== null && (
                          <span className="font-medium text-foreground">
                            {" "}
                            · {formatDistance(row.distance)} away
                          </span>
                        )}
                      </span>
                    </p>
                  </div>
                </header>

                <ul className="mt-3 divide-y rounded-lg border">
                  {row.matches.map((m) => (
                    <li
                      key={m.medicine_id}
                      className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {medicineLabel(m)}
                          {m.category === "prescription" && (
                            <span
                              title="Prescription required"
                              className="ml-1.5 rounded bg-muted px-1 py-0.5 align-middle text-[10px] font-semibold text-muted-foreground"
                            >
                              Rx
                            </span>
                          )}
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

                <footer className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={directionsUrl(row.pharmacy)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ size: "sm" })}
                  >
                    <Navigation /> Directions
                  </a>
                  {row.pharmacy.contact_number && (
                    <a
                      href={telHref(row.pharmacy.contact_number)}
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                    >
                      <Phone /> {row.pharmacy.contact_number}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedId(row.pharmacy.id)}
                    className={buttonVariants({ size: "sm", variant: "ghost" })}
                  >
                    <MapPin /> Show on map
                  </button>
                </footer>
              </article>
            </li>
          ))}
        </ol>
      </div>

      <div className="order-1 lg:order-2">
        <div className="h-64 sm:h-80 lg:sticky lg:top-20 lg:h-[calc(100dvh-7rem)]">
          <PharmacyMap
            points={points}
            user={position}
            selectedId={selectedId}
            onSelect={setSelectedId}
            className="size-full"
          />
        </div>
      </div>
    </div>
  );
}
