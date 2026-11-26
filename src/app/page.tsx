import { ArrowRight, MapPinned, Search, Store } from "lucide-react";
import Link from "next/link";

import { PharmacyMap } from "@/components/map/pharmacy-map";
import { PopularSearches } from "@/components/popular-searches";
import { SearchForm } from "@/components/search-form";
import { buttonVariants } from "@/components/ui/button";
import { getPharmacies } from "@/lib/pharmalink/queries";

const STEPS = [
  {
    icon: Search,
    title: "Search your medicine",
    body: "Type the generic or brand name. No account needed.",
  },
  {
    icon: MapPinned,
    title: "See who has it",
    body: "Participating pharmacies with stock show up on the map, nearest first if you share your location.",
  },
  {
    icon: Store,
    title: "Visit the pharmacy",
    body: "Get directions or call ahead. You buy and pay at the pharmacy counter as usual.",
  },
];

export default async function HomePage() {
  const pharmacies = await getPharmacies();
  const cities = new Set(pharmacies.map((p) => p.city));

  return (
    <>
      <section className="border-b bg-gradient-to-b from-brand-soft to-background">
        <div className="mx-auto max-w-3xl space-y-6 px-4 pt-14 pb-12 text-center sm:pt-20">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Find out which pharmacy has your medicine, before you go
          </h1>
          <p className="mx-auto max-w-xl text-pretty text-muted-foreground sm:text-lg">
            PharmaLink shows live stock from participating pharmacies in Trece Martires, Tanza and
            General Trias, so you don’t have to visit store after store.
          </p>
          <SearchForm size="lg" className="mx-auto max-w-2xl" />
          <PopularSearches className="justify-center" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-xl border bg-card p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-brand-soft text-primary">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
              </div>
              <h2 className="font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Participating pharmacies</h2>
            <p className="text-sm text-muted-foreground">
              {pharmacies.length} {pharmacies.length === 1 ? "pharmacy" : "pharmacies"} across{" "}
              {cities.size} {cities.size === 1 ? "city" : "cities"} in Cavite
            </p>
          </div>
          <Link href="/pharmacies" className={buttonVariants({ variant: "outline", size: "sm" })}>
            View all <ArrowRight />
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
