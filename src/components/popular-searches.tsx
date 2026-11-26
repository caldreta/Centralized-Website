import Link from "next/link";

import { cn } from "@/lib/utils";

const POPULAR = ["Paracetamol", "Amoxicillin", "Losartan", "Metformin", "Cetirizine", "Salbutamol"];

export function PopularSearches({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-sm", className)}>
      <span className="text-muted-foreground">Popular:</span>
      {POPULAR.map((name) => (
        <Link
          key={name}
          href={`/search?q=${encodeURIComponent(name)}`}
          className="rounded-full border bg-background px-3 py-1 transition-colors hover:border-primary/40 hover:bg-brand-soft"
        >
          {name}
        </Link>
      ))}
    </div>
  );
}
