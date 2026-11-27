"use client";

import { MapPinOff } from "lucide-react";
import { catchError, type ErrorInfo } from "next/error";

/**
 * If the map ever fails, show a small notice in its place instead of letting
 * the error replace the whole page. The list, search and buttons keep working.
 */
function MapFallback(_props: object, { retry }: ErrorInfo) {
  return (
    <div className="grid size-full place-items-center bg-muted p-6 text-center">
      <div className="space-y-2">
        <MapPinOff className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium">The map couldn’t load</p>
        <button
          type="button"
          onClick={() => retry()}
          className="text-sm font-medium text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const MapErrorBoundary = catchError(MapFallback);
