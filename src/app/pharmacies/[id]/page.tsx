import { ArrowLeft, Clock, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PharmacyMap } from "@/components/map/pharmacy-map";
import { PharmacyActions } from "@/components/pharmacy-actions";
import { PharmacyStockList } from "@/components/pharmacy-stock-list";
import { Skeleton } from "@/components/ui/skeleton";
import { sanitizeSearchTerm, telHref } from "@/lib/pharmalink/format";
import { getPharmacy, getPharmacyStock } from "@/lib/pharmalink/queries";

export async function generateMetadata({
  params,
}: PageProps<"/pharmacies/[id]">): Promise<Metadata> {
  const { id } = await params;
  const pharmacy = await getPharmacy(id);
  return pharmacy
    ? {
        title: pharmacy.name,
        description: `Medicines available at ${pharmacy.name}, ${pharmacy.city}.`,
      }
    : { title: "Pharmacy not found" };
}

export default function PharmacyPage({ params, searchParams }: PageProps<"/pharmacies/[id]">) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:py-8">
      <Suspense fallback={<PharmacySkeleton />}>
        <PharmacyDetails params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function PharmacyDetails({
  params,
  searchParams,
}: Pick<PageProps<"/pharmacies/[id]">, "params" | "searchParams">) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  const pharmacy = await getPharmacy(id);
  if (!pharmacy) notFound();

  // Came here from a search? Offer the way back to those results.
  const fromQuery = sanitizeSearchTerm(typeof from === "string" ? from : "");
  const back = fromQuery
    ? { href: `/search?q=${encodeURIComponent(fromQuery)}`, label: `Back to results for “${fromQuery}”` }
    : { href: "/pharmacies", label: "All pharmacies" };

  return (
    <>
      <Link
        href={back.href}
        className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {back.label}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="space-y-6">
          <header className="space-y-4 rounded-2xl border bg-card p-5 shadow-[0_1px_3px_rgb(15_40_40/0.04)] sm:p-6">
            <div>
              <p className="text-sm font-medium text-primary">{pharmacy.city}</p>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-balance">
                {pharmacy.name}
              </h1>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex items-start gap-2.5">
                <dt className="sr-only">Address</dt>
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <dd>{pharmacy.address}</dd>
              </div>
              {pharmacy.opening_hours && (
                <div className="flex items-start gap-2.5">
                  <dt className="sr-only">Opening hours</dt>
                  <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <dd>{pharmacy.opening_hours}</dd>
                </div>
              )}
              {pharmacy.contact_number && (
                <div className="flex items-start gap-2.5">
                  <dt className="sr-only">Phone</dt>
                  <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <dd>
                    <a href={telHref(pharmacy.contact_number)} className="hover:underline">
                      {pharmacy.contact_number}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            <PharmacyActions pharmacy={pharmacy} />
          </header>

          <section aria-labelledby="stock-heading" className="space-y-3">
            <h2 id="stock-heading" className="text-lg font-semibold">
              Medicines at this pharmacy
            </h2>
            <Suspense fallback={<Skeleton className="h-72 w-full rounded-2xl" />}>
              <Stock id={pharmacy.id} initialFilter={fromQuery} />
            </Suspense>
          </section>
        </div>

        <div className="h-64 sm:h-80 lg:sticky lg:top-24 lg:h-96">
          <PharmacyMap
            className="size-full"
            points={[
              {
                id: pharmacy.id,
                name: pharmacy.name,
                latitude: pharmacy.latitude,
                longitude: pharmacy.longitude,
                popupDetail: pharmacy.address,
              },
            ]}
          />
        </div>
      </div>
    </>
  );
}

async function Stock({ id, initialFilter }: { id: string; initialFilter: string }) {
  const stock = await getPharmacyStock(id);
  return <PharmacyStockList stock={stock} initialFilter={initialFilter} />;
}

function PharmacySkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-40 rounded-full" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="space-y-6">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl lg:h-96" />
      </div>
    </div>
  );
}
