import { Navigation, Phone } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { directionsUrl, telHref } from "@/lib/pharmalink/format";
import type { Pharmacy } from "@/lib/pharmalink/types";
import { cn } from "@/lib/utils";

/** The two things a visitor most needs: get there, or call first. Large, tappable, always visible. */
export function PharmacyActions({
  pharmacy,
  className,
}: {
  pharmacy: Pick<Pharmacy, "name" | "latitude" | "longitude" | "contact_number">;
  className?: string;
}) {
  const phone = pharmacy.contact_number;
  return (
    <div className={cn("grid gap-2 sm:flex", phone ? "grid-cols-2" : "grid-cols-1", className)}>
      <a
        href={directionsUrl(pharmacy)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Directions to ${pharmacy.name} (opens Google Maps)`}
        className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 px-5 text-sm shadow-sm")}
      >
        <Navigation className="size-4" /> Directions
      </a>
      {phone && (
        <a
          href={telHref(phone)}
          aria-label={`Call ${pharmacy.name} at ${phone}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 gap-2 border-primary/35 bg-card px-5 text-sm text-primary hover:bg-brand-soft hover:text-primary",
          )}
        >
          <Phone className="size-4" /> Call
        </a>
      )}
    </div>
  );
}
