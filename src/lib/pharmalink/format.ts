// Pure helpers shared by server and client code.

import type { DayOfWeek, MedicineAvailability, OpeningHours, StockStatus } from "./types";

const STATUS_ORDER: Record<StockStatus, number> = {
  in_stock: 0,
  out_of_stock: 1,
};

export const STATUS_LABEL: Record<StockStatus, string> = {
  in_stock: "In stock",
  out_of_stock: "Out of stock",
};

export function compareStatus(a: StockStatus, b: StockStatus): number {
  return STATUS_ORDER[a] - STATUS_ORDER[b];
}

export function bestStatus(rows: Pick<MedicineAvailability, "stock_status">[]): StockStatus {
  return rows.reduce<StockStatus>(
    (best, row) => (compareStatus(row.stock_status, best) < 0 ? row.stock_status : best),
    "out_of_stock",
  );
}

export function isAvailable(status: StockStatus): boolean {
  return status === "in_stock";
}

/** Keeps letters (any language), digits, spaces and hyphens; max 60 chars. */
export function sanitizeSearchTerm(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export function medicineLabel(m: Pick<MedicineAvailability, "generic_name" | "brand_name">): string {
  return m.brand_name ? `${m.generic_name} (${m.brand_name})` : m.generic_name;
}

export function medicineDetail(
  m: Pick<MedicineAvailability, "strength" | "dosage_form">,
): string {
  // form arrives in lower-case words ("chewable tablet"); capitalise the first letter.
  const form = m.dosage_form ? m.dosage_form.charAt(0).toUpperCase() + m.dosage_form.slice(1) : null;
  return [m.strength, form].filter(Boolean).join(" · ");
}

// --- Opening hours ------------------------------------------------------------
// The views give Philippine clock times, so "open now" is always worked out in
// Manila time, never in the server's or the visitor's time zone.

export const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const DAY_LABEL: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

/** "08:00:00" → "08:00" */
export function toHHMM(time: string): string {
  return time.trim().slice(0, 5);
}

const minutesOf = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** "21:00" → "9:00 PM" */
export function formatTime(hhmm: string): string {
  const total = minutesOf(hhmm);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** 00:00 to 23:59 means open all day. */
export function isAllDay(h: Pick<OpeningHours, "opens" | "closes">): boolean {
  return h.opens === "00:00" && h.closes === "23:59";
}

const manilaFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Day of week and minutes since midnight, in Manila. */
export function manilaNow(nowMs: number): { day: DayOfWeek; minutes: number } {
  const parts = manilaFormat.formatToParts(new Date(nowMs));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: get("weekday").toUpperCase() as DayOfWeek,
    minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
  };
}

export type OpenState =
  | { kind: "not_given" }
  | { kind: "open"; allDay: boolean; closes: string }
  | { kind: "closed"; opensToday: string | null; next: { day: DayOfWeek; opens: string } | null };

export function openState(hours: OpeningHours[], nowMs: number): OpenState {
  if (hours.length === 0) return { kind: "not_given" };
  const now = manilaNow(nowMs);
  const today = hours.find((h) => h.day === now.day);

  if (today) {
    const allDay = isAllDay(today);
    if (allDay || (now.minutes >= minutesOf(today.opens) && now.minutes < minutesOf(today.closes))) {
      return { kind: "open", allDay, closes: today.closes };
    }
    if (now.minutes < minutesOf(today.opens)) {
      return { kind: "closed", opensToday: today.opens, next: null };
    }
  }

  const start = DAY_ORDER.indexOf(now.day);
  for (let i = 1; i <= 7; i++) {
    const day = DAY_ORDER[(start + i) % 7];
    const h = hours.find((x) => x.day === day);
    if (h) return { kind: "closed", opensToday: null, next: { day, opens: h.opens } };
  }
  return { kind: "closed", opensToday: null, next: null };
}

/** Short text for an OpenState, e.g. "Open now · closes 9:00 PM". */
export function openStateText(state: OpenState, todayPlusOne?: DayOfWeek): string {
  switch (state.kind) {
    case "not_given":
      return "Hours not given";
    case "open":
      return state.allDay ? "Open 24 hours" : `Open now · closes ${formatTime(state.closes)}`;
    case "closed":
      if (state.opensToday) return `Closed · opens ${formatTime(state.opensToday)}`;
      if (state.next) {
        const when = state.next.day === todayPlusOne ? "tomorrow" : DAY_LABEL[state.next.day].slice(0, 3);
        return `Closed · opens ${when} ${formatTime(state.next.opens)}`;
      }
      return "Closed";
  }
}

/** Great-circle distance in kilometres. */
export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function directionsUrl(p: { latitude: number; longitude: number }): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function formatRelative(iso: string, now: number): string {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
