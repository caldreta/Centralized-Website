import type { StockStatus } from "@/lib/pharmalink/types";

export interface MapPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Pin colour. "none" = neutral brand colour (no stock context). */
  status?: StockStatus | "none";
  /** Short text inside the pin, e.g. a list number. */
  label?: string;
  popupDetail?: string;
  href?: string;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface PharmacyMapProps {
  points: MapPoint[];
  user?: LatLng | null;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}
