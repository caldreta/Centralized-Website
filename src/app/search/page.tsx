import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PopularSearches } from "@/components/popular-searches";
import { SearchForm } from "@/components/search-form";
import { SearchResults } from "@/components/search-results";
import { Skeleton } from "@/components/ui/skeleton";
import { sanitizeSearchTerm } from "@/lib/pharmalink/format";
import { searchMedicines } from "@/lib/pharmalink/queries";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { q } = await searchParams;
  const query = sanitizeSearchTerm(typeof q === "string" ? q : "");
  return { title: query ? `${query}: where to buy` : "Search medicines" };
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <Suspense fallback={<SearchSkeleton />}>
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchContent({ searchParams }: Pick<PageProps<"/search">, "searchParams">) {
  const { q } = await searchParams;
  const query = sanitizeSearchTerm(typeof q === "string" ? q : "");

  return (
    <div className="space-y-6">
      <SearchForm key={`form:${query}`} defaultValue={query} autoFocus={!query} />
      {query.length < 2 ? (
        <div className="space-y-4 rounded-2xl border border-dashed bg-card/60 p-8 text-center">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">Search for a medicine</h1>
            <p className="text-sm text-muted-foreground">
              Type its generic or brand name to see which pharmacies have it today.
            </p>
          </div>
          <PopularSearches className="justify-center" />
          <Link href="/pharmacies" className="inline-flex text-sm font-medium text-primary hover:underline">
            Or browse all pharmacies
          </Link>
        </div>
      ) : (
        <Suspense key={`results:${query}`} fallback={<ResultsSkeleton />}>
          <Results query={query} />
        </Suspense>
      )}
    </div>
  );
}

async function Results({ query }: { query: string }) {
  const results = await searchMedicines(query);
  return <SearchResults query={query} results={results} />;
}

function SearchSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full rounded-xl" />
      <ResultsSkeleton />
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-7 w-72 max-w-full" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="hidden rounded-2xl lg:block lg:h-[calc(100dvh-8rem)]" />
      </div>
    </div>
  );
}
