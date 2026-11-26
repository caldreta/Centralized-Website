"use client";

import { MapPin, Navigation, Phone } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { LocationButton } from "@/components/location-button";
import { PharmacyMap } from "@/components/map/pharmacy-map";
import { buttonVariants } from "@/components/ui/button";
import { useUserLocation } from "@/hooks/use-user-location";
import { directionsUrl, distanceKm, formatDistance, telHref } from "@/lib/pharmalink/format";
import type { Pharmacy } from "@/lib/pharmalink/types";
import { cn } from "@/lib/utils";

export function PharmacyDirectory({ pharmacies }: { pharmacies: Pharmacy[] }) {
  const { position } = useUserLocation();
  const [city, setCity] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="order-2 space-y-4 lg:order-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by city">
            {[null, ...cities].map((c) => (
              <button
                key={c ?? "all"}
                type="button"
                aria-pressed={city === c}
                onClick={() => setCity(c)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  city === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted",
                )}
              >
                {c ?? "All cities"}
              </button>
            ))}
          </div>
          <LocationButton />
        </div>

        <ul className="space-y-3">
          {rows.map(({ pharmacy, distance }) => (
            <li
              key={pharmacy.id}
              className={cn(
                "rounded-xl border bg-card p-4",
                selectedId === pharmacy.id && "ring-2 ring-primary/40",
              )}
            >
              <h2 className="font-semibold">
                <Link href={`/pharmacies/${pharmacy.id}`} className="hover:underline">
                  {pharmacy.name}
                </Link>
              </h2>
              <p className="mt-0.5 flex items-start gap-1 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {pharmacy.address}
                  {distance !== null && (
                    <span className="font-medium text-foreground">
                      {" "}
                      · {formatDistance(distance)} away
                    </span>
                  )}
                </span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/pharmacies/${pharmacy.id}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  See medicines
                </Link>
                <a
                  href={directionsUrl(pharmacy)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  <Navigation /> Directions
                </a>
                {pharmacy.contact_number && (
                  <a
                    href={telHref(pharmacy.contact_number)}
                    className={buttonVariants({ size: "sm", variant: "ghost" })}
                  >
                    <Phone /> {pharmacy.contact_number}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedId(pharmacy.id)}
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                >
                  <MapPin /> Show on map
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="order-1 lg:order-2">
        <div className="h-64 sm:h-80 lg:sticky lg:top-20 lg:h-[calc(100dvh-7rem)]">
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
        </div>
      </div>
    </div>
  );
}
