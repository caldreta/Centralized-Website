import { ArrowRight, MapPinned, Search, Store } from "lucide-react";
import Link from "next/link";

import { PharmacyMap } from "@/components/map/pharmacy-map";
import { PopularSearches } from "@/components/popular-searches";
import { SearchForm } from "@/components/search-form";
import { buttonVariants } from "@/components/ui/button";
import { getPharmacies } from "@/lib/pharmalink/queries";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Search,
    title: "Search your medicine",
    body: "Type the generic or brand name. No account needed.",
  },
  {
    icon: MapPinned,
    title: "See who has it",
    body: "Pharmacies with stock appear on the map, nearest first if you share your location.",
  },
  {
    icon: Store,
    title: "Visit the pharmacy",
    body: "Get directions or call ahead, then buy at the counter as usual.",
  },
];

export default async function HomePage() {
  const pharmacies = await getPharmacies();
  const cities = new Set(pharmacies.map((p) => p.city));

  return (
    <>
      <section className="relative overflow-hidden">
        {/* soft background wash */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_28rem_at_50%_-6rem,var(--brand-soft),transparent)]"
        />
        <div className="relative mx-auto max-w-3xl space-y-7 px-4 pt-12 pb-14 text-center sm:pt-20 sm:pb-20">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-status-in" aria-hidden="true" />
            {pharmacies.length > 0
              ? `${pharmacies.length} ${pharmacies.length === 1 ? "pharmacy" : "pharmacies"} in Trece Martires, Tanza & General Trias`
              : "Pilot pharmacies in Trece Martires, Tanza & General Trias are joining soon"}
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Find your medicine before you leave home
            </h1>
            <p className="mx-auto max-w-xl text-pretty text-muted-foreground sm:text-lg">
              See which nearby pharmacies have it in stock, so you only make one trip.
            </p>
          </div>
          <SearchForm size="lg" className="mx-auto max-w-2xl text-left" />
          <PopularSearches className="justify-center" />
        </div>
      </section>

      <section aria-labelledby="how-heading" className="mx-auto w-full max-w-6xl px-4 pb-14">
        <h2 id="how-heading" className="sr-only">
          How it works
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-[0_1px_3px_rgb(15_40_40/0.04)]">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-primary">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Step {i + 1}</p>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="pharmacies-heading" className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="pharmacies-heading" className="text-xl font-semibold tracking-tight">
              Participating pharmacies
            </h2>
            <p className="text-sm text-muted-foreground">
              {pharmacies.length > 0 ? (
                <>
                  {pharmacies.length} {pharmacies.length === 1 ? "pharmacy" : "pharmacies"} across{" "}
                  {cities.size} {cities.size === 1 ? "city" : "cities"} in Cavite
                </>
              ) : (
                "The first pharmacies appear here once they finish counting their stock."
              )}
            </p>
          </div>
          <Link
            href="/pharmacies"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 gap-1.5 rounded-full bg-card px-4")}
          >
            Browse pharmacies <ArrowRight className="size-4" />
          </Link>
        </div>
        <PharmacyMap
          className="h-80 sm:h-96"
          points={pharmacies.map((p) => ({
            id: p.id,
            name: p.name,
            latitude: p.latitude,
            longitude: p.longitude,
            popupDetail: p.address,
            href: `/pharmacies/${p.id}`,
          }))}
        />
      </section>
    </>
  );
}
