import type { Metadata } from "next";
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
  return { title: query ? `${query}: where to buy` : "Find medicine" };
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
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
        <div className="space-y-3 rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">Type a medicine name to see which pharmacies have it.</p>
          <PopularSearches className="justify-center" />
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
      <Skeleton className="h-10 w-full" />
      <ResultsSkeleton />
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="order-2 space-y-3 lg:order-1">
        <Skeleton className="h-5 w-64" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="order-1 h-64 rounded-xl sm:h-80 lg:order-2 lg:h-[calc(100dvh-7rem)]" />
    </div>
  );
}
