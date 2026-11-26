"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { RelativeTime } from "@/components/relative-time";
import { StatusBadge } from "@/components/status-badge";
import { compareStatus, medicineDetail, medicineLabel } from "@/lib/pharmalink/format";
import type { MedicineAvailability } from "@/lib/pharmalink/types";

export function PharmacyStockList({ stock }: { stock: MedicineAvailability[] }) {
  const [filter, setFilter] = useState("");

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
      <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        This pharmacy hasn’t listed any medicines yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Filter ${stock.length} medicines`}
          aria-label="Filter medicines at this pharmacy"
          className="h-10 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No medicine matches “{filter}”.</p>
      ) : (
        <ul className="divide-y rounded-xl border bg-card">
          {rows.map((m) => (
            <li
              key={m.medicine_id}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {medicineLabel(m)}
                  {m.category === "prescription" && (
                    <span
                      title="Prescription required"
                      className="ml-1.5 rounded bg-muted px-1 py-0.5 align-middle text-[10px] font-semibold text-muted-foreground"
                    >
                      Rx
                    </span>
                  )}
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
