"use client";

import { Clock } from "lucide-react";

import { useMinuteClock } from "@/hooks/use-minute-clock";
import {
  DAY_LABEL,
  DAY_ORDER,
  formatTime,
  isAllDay,
  manilaNow,
  openState,
  openStateText,
} from "@/lib/pharmalink/format";
import type { OpeningHours } from "@/lib/pharmalink/types";
import { cn } from "@/lib/utils";

/** "Open now · closes 9:00 PM" / "Closed · opens 8:00 AM" / "Hours not given", in Manila time. */
export function OpenStatus({ hours, className }: { hours: OpeningHours[]; className?: string }) {
  const now = useMinuteClock();
  if (now === null) {
    // Server render: reserve the space, decide in the browser.
    return <span className={cn("inline-block h-5", className)} aria-hidden="true" />;
  }
  const state = openState(hours, now);
  const today = manilaNow(now).day;
  const tomorrow = DAY_ORDER[(DAY_ORDER.indexOf(today) + 1) % 7];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        state.kind === "open" ? "font-medium text-status-in-text" : "text-muted-foreground",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-2 rounded-full",
          state.kind === "open" ? "bg-status-in" : state.kind === "closed" ? "bg-status-out" : "border border-status-out",
        )}
      />
      {openStateText(state, tomorrow)}
    </span>
  );
}

/** The week's hours, today highlighted (Manila). */
export function OpeningHoursTable({ hours }: { hours: OpeningHours[] }) {
  const now = useMinuteClock();
  const today = now === null ? null : manilaNow(now).day;

  if (hours.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="size-4" aria-hidden="true" />
        This pharmacy hasn’t given its opening hours yet. Call ahead to check.
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Opening hours (Philippine time)</caption>
      <tbody>
        {DAY_ORDER.map((day) => {
          const h = hours.find((x) => x.day === day);
          const isToday = day === today;
          return (
            <tr key={day} className={cn(isToday && "font-semibold text-foreground", !isToday && "text-muted-foreground")}>
              <th scope="row" className="py-1 pr-4 text-left font-[inherit]">
                {DAY_LABEL[day]}
                {isToday && <span className="ml-1.5 text-xs font-medium text-primary">Today</span>}
              </th>
              <td className="py-1 text-right tabular-nums">
                {!h ? "Closed" : isAllDay(h) ? "Open 24 hours" : `${formatTime(h.opens)} – ${formatTime(h.closes)}`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
