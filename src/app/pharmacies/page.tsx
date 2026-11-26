import type { Metadata } from "next";

import { PharmacyDirectory } from "@/components/pharmacy-directory";
import { getPharmacies } from "@/lib/pharmalink/queries";

export const metadata: Metadata = {
  title: "Participating pharmacies",
};

export default async function PharmaciesPage() {
  const pharmacies = await getPharmacies();
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Participating pharmacies</h1>
        <p className="text-sm text-muted-foreground">
          Independent pharmacies that share their stock on PharmaLink.
        </p>
      </div>
      <PharmacyDirectory pharmacies={pharmacies} />
    </div>
  );
}
