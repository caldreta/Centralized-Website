"use client";

import { LocateFixed, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUserLocation } from "@/hooks/use-user-location";

export function LocationButton() {
  const { location, requestLocation } = useUserLocation();

  const message =
    location.status === "denied"
      ? "Location is blocked. Allow it in your browser settings to sort by distance."
      : location.status === "unavailable"
        ? "Couldn't get your location. Try again."
        : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant={location.status === "ready" ? "secondary" : "outline"}
        size="sm"
        onClick={requestLocation}
        disabled={location.status === "locating"}
      >
        {location.status === "locating" ? (
          <Loader2 className="animate-spin" />
        ) : (
          <LocateFixed />
        )}
        {location.status === "ready" ? "Sorted by distance" : "Use my location"}
      </Button>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
