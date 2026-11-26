import type { Metadata } from "next";

import { PharmacyDirectory } from "@/components/pharmacy-directory";
import { getPharmacies } from "@/lib/pharmalink/queries";

export const metadata: Metadata = {
  title: "Pharmacies",
};

export default async function PharmaciesPage() {
  const pharmacies = await getPharmacies();
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pharmacies</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Independent pharmacies that share their stock on PharmaLink. Open one to see what
          it has today.
        </p>
      </div>
      <PharmacyDirectory pharmacies={pharmacies} />
    </div>
  );
}
