"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { RelativeTime } from "@/components/relative-time";
import { RxTag } from "@/components/rx-tag";
import { StatusBadge } from "@/components/status-badge";
import { compareStatus, medicineDetail, medicineLabel } from "@/lib/pharmalink/format";
import type { MedicineAvailability } from "@/lib/pharmalink/types";

export function PharmacyStockList({
  stock,
  initialFilter = "",
}: {
  stock: MedicineAvailability[];
  initialFilter?: string;
}) {
  const [filter, setFilter] = useState(initialFilter);

  const rows = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return stock
      .filter(
        (m) =>
          !needle ||
          m.generic_name.toLowerCase().includes(needle) ||
          (m.brand_name?.toLowerCase().includes(needle) ?? false),
      )
      .sort(
        (a, b) =>
          compareStatus(a.stock_status, b.stock_status) ||
          a.generic_name.localeCompare(b.generic_name),
      );
  }, [stock, filter]);

  if (stock.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed bg-card/60 p-6 text-center text-sm text-muted-foreground">
        This pharmacy hasn’t listed any medicines yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Filter ${stock.length} medicines`}
          aria-label="Filter medicines at this pharmacy"
          className="h-11 w-full rounded-xl border bg-card pr-10 pl-10 text-base shadow-[0_1px_3px_rgb(15_40_40/0.04)] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
        />
        {filter && (
          <button
            type="button"
            onClick={() => setFilter("")}
            aria-label="Clear filter"
            className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {filter && (
        <p className="text-sm text-muted-foreground">
          Showing {rows.length} of {stock.length} ·{" "}
          <button type="button" onClick={() => setFilter("")} className="font-medium text-primary hover:underline">
            Show all medicines
          </button>
        </p>
      )}

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-card/60 py-6 text-center text-sm text-muted-foreground">
          No medicine here matches “{filter}”.
        </p>
      ) : (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border bg-card shadow-[0_1px_3px_rgb(15_40_40/0.04)]">
          {rows.map((m) => (
            <li
              key={m.key}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {medicineLabel(m)}
                  {m.category === "prescription" && <RxTag />}
                </p>
                <p className="text-xs text-muted-foreground">{medicineDetail(m)}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <StatusBadge status={m.stock_status} />
                <RelativeTime iso={m.updated_at} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
