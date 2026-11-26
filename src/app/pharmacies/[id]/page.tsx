import { ArrowLeft, Clock, MapPin, Navigation, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PharmacyMap } from "@/components/map/pharmacy-map";
import { PharmacyStockList } from "@/components/pharmacy-stock-list";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { directionsUrl, telHref } from "@/lib/pharmalink/format";
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

export default function PharmacyPage({ params }: PageProps<"/pharmacies/[id]">) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
      <Link
        href="/pharmacies"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All pharmacies
      </Link>
      <Suspense fallback={<PharmacySkeleton />}>
        <PharmacyDetails params={params} />
      </Suspense>
    </div>
  );
}

async function PharmacyDetails({ params }: Pick<PageProps<"/pharmacies/[id]">, "params">) {
  const { id } = await params;
  const pharmacy = await getPharmacy(id);
  if (!pharmacy) notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="space-y-6">
        <header className="space-y-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{pharmacy.name}</h1>
            <p className="text-sm text-muted-foreground">{pharmacy.city}</p>
          </div>
          <dl className="space-y-1.5 text-sm">
            <div className="flex items-start gap-2">
              <dt className="sr-only">Address</dt>
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <dd>{pharmacy.address}</dd>
            </div>
            {pharmacy.opening_hours && (
              <div className="flex items-start gap-2">
                <dt className="sr-only">Opening hours</dt>
                <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <dd>{pharmacy.opening_hours}</dd>
              </div>
            )}
            {pharmacy.contact_number && (
              <div className="flex items-start gap-2">
                <dt className="sr-only">Contact number</dt>
                <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <dd>
                  <a href={telHref(pharmacy.contact_number)} className="hover:underline">
                    {pharmacy.contact_number}
                  </a>
                </dd>
              </div>
            )}
          </dl>
          <div className="flex flex-wrap gap-2">
            <a
              href={directionsUrl(pharmacy)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants()}
            >
              <Navigation /> Get directions
            </a>
            {pharmacy.contact_number && (
              <a
                href={telHref(pharmacy.contact_number)}
                className={buttonVariants({ variant: "outline" })}
              >
                <Phone /> Call to confirm
              </a>
            )}
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Medicines at this pharmacy</h2>
          <Suspense fallback={<Skeleton className="h-72 w-full rounded-xl" />}>
            <Stock id={pharmacy.id} />
          </Suspense>
        </section>
      </div>

      <div className="h-64 sm:h-80 lg:sticky lg:top-20 lg:h-96">
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
  );
}

async function Stock({ id }: { id: string }) {
  const stock = await getPharmacyStock(id);
  return <PharmacyStockList stock={stock} />;
}

function PharmacySkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="space-y-3">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl lg:h-96" />
    </div>
  );
}
