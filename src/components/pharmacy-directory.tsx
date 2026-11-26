"use client";

import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { ListMapLayout, type ListMapView } from "@/components/list-map-layout";
import { LocationButton } from "@/components/location-button";
import { PharmacyMap } from "@/components/map/pharmacy-map";
import { OpenStatus } from "@/components/opening-hours";
import { PharmacyActions } from "@/components/pharmacy-actions";
import { useUserLocation } from "@/hooks/use-user-location";
import { distanceKm, formatDistance } from "@/lib/pharmalink/format";
import type { Pharmacy } from "@/lib/pharmalink/types";
import { cn } from "@/lib/utils";

export function PharmacyDirectory({ pharmacies }: { pharmacies: Pharmacy[] }) {
  const { position } = useUserLocation();
  const [city, setCity] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<ListMapView>("list");

  const cities = useMemo(
    () => [...new Set(pharmacies.map((p) => p.city))].sort(),
    [pharmacies],
  );

  const rows = useMemo(() => {
    const list = pharmacies
      .filter((p) => !city || p.city === city)
      .map((p) => ({ pharmacy: p, distance: position ? distanceKm(position, p) : null }));
    if (position) list.sort((a, b) => a.distance! - b.distance!);
    return list;
  }, [pharmacies, city, position]);

  const showOnMap = useCallback((id: string) => {
    setSelectedId(id);
    setView("map");
  }, []);

  if (pharmacies.length === 0) {
    return (
      <div className="space-y-2 rounded-2xl border border-dashed bg-card/60 p-8 text-center">
        <p className="font-semibold">No pharmacies are listed yet</p>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          The pilot pharmacies in Trece Martires, Tanza and General Trias appear here as soon as
          each one finishes counting its stock. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by city">
          {[null, ...cities].map((c) => (
            <button
              key={c ?? "all"}
              type="button"
              aria-pressed={city === c}
              onClick={() => setCity(c)}
              className={cn(
                "h-9 rounded-full border px-4 text-sm font-medium transition-colors",
                city === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {c ?? "All cities"}
            </button>
          ))}
        </div>
        <LocationButton />
      </div>

      <ListMapLayout
        view={view}
        onViewChange={setView}
        list={
          <ul className="space-y-3">
            {rows.map(({ pharmacy, distance }) => (
              <li
                key={pharmacy.id}
                className={cn(
                  "rounded-2xl border bg-card p-4 shadow-[0_1px_3px_rgb(15_40_40/0.04)] sm:p-5",
                  selectedId === pharmacy.id && "ring-2 ring-primary/35",
                )}
              >
                <h2 className="text-base font-semibold">
                  <Link href={`/pharmacies/${pharmacy.id}`} className="hover:text-primary hover:underline">
                    {pharmacy.name}
                  </Link>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{pharmacy.address}</p>
                <OpenStatus hours={pharmacy.hours} className="mt-1" />
                {distance !== null && (
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium">
                    <MapPin className="size-3.5 text-primary" aria-hidden="true" />
                    {formatDistance(distance)} away
                  </p>
                )}

                <PharmacyActions pharmacy={pharmacy} className="mt-4" />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <Link
                    href={`/pharmacies/${pharmacy.id}`}
                    className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
                  >
                    See medicines in stock <ChevronRight className="size-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => showOnMap(pharmacy.id)}
                    className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground lg:hidden"
                  >
                    <MapPin className="size-4" /> See on map
                  </button>
                </div>
              </li>
            ))}
          </ul>
        }
        map={
          <PharmacyMap
            className="size-full"
            user={position}
            selectedId={selectedId}
            onSelect={setSelectedId}
            points={rows.map(({ pharmacy }) => ({
              id: pharmacy.id,
              name: pharmacy.name,
              latitude: pharmacy.latitude,
              longitude: pharmacy.longitude,
              popupDetail: pharmacy.address,
              href: `/pharmacies/${pharmacy.id}`,
            }))}
          />
        }
      />
    </div>
  );
}
