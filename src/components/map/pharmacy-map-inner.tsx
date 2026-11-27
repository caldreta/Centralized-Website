"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { directionsUrl } from "@/lib/pharmalink/format";

import type { MapPoint, PharmacyMapProps } from "./types";

// WHY THIS IS HAND-WRITTEN (not react-leaflet):
// Next.js keeps recently visited pages alive in the background. When a page is
// hidden, React runs every effect's clean-up; when it is shown again, it runs
// the effects again. react-leaflet creates its map once (in a ref callback), so
// after a hide/show it kept using a map that had already been removed and
// crashed ("Map container is being reused", "reading 'appendChild'"), which
// showed the site's error page when switching pages quickly.
// Here the map is created in an effect and removed in its clean-up, so every
// show gets a brand-new map.

// Leaflet bug guard: a zoom animation schedules _onZoomTransitionEnd 250 ms
// later. If the map is removed in between, that timer touches the deleted map
// pane and throws ("reading '_leaflet_pos'"). Skip it once the map is gone.
type LeafletMapInternals = { _mapPane?: HTMLElement; _animatingZoom?: boolean; _onZoomTransitionEnd: () => void };
const mapProto = L.Map.prototype as unknown as LeafletMapInternals;
if (!(mapProto._onZoomTransitionEnd as { __guarded?: boolean }).__guarded) {
  const original = mapProto._onZoomTransitionEnd;
  const guarded = function (this: LeafletMapInternals) {
    if (!this._mapPane) {
      this._animatingZoom = false;
      return;
    }
    original.call(this);
  };
  (guarded as { __guarded?: boolean }).__guarded = true;
  mapProto._onZoomTransitionEnd = guarded;
}

/** Centre of the pilot area (Trece Martires / Tanza / General Trias). */
const PILOT_CENTER: L.LatLngTuple = [14.33, 120.89];

const iconCache = new Map<string, L.DivIcon>();
function pinIcon(point: MapPoint, selected: boolean): L.DivIcon {
  const status = point.status ?? "none";
  const key = `${status}:${point.label ?? ""}:${selected}`;
  let icon = iconCache.get(key);
  if (!icon) {
    const label = point.label ? `<span>${escapeHtml(point.label)}</span>` : "";
    icon = L.divIcon({
      className: "",
      html: `<div class="pl-pin" data-status="${status}" data-selected="${selected}">${label}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
    iconCache.set(key, icon);
  }
  return icon;
}

const userIcon = L.divIcon({
  className: "",
  html: '<div class="pl-user-dot"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function popupHtml(point: MapPoint): string {
  const detail = point.popupDetail ? `<p class="text-xs">${escapeHtml(point.popupDetail)}</p>` : "";
  const view = point.href
    ? `<a href="${escapeHtml(point.href)}" data-internal class="text-primary underline">View pharmacy</a>`
    : "";
  return `<div class="min-w-44 space-y-1.5">
    <p class="text-sm font-semibold">${escapeHtml(point.name)}</p>
    ${detail}
    <div class="flex gap-3 pt-0.5 text-xs font-medium">
      <a href="${escapeHtml(directionsUrl(point))}" target="_blank" rel="noopener noreferrer" class="text-primary underline">Directions</a>
      ${view}
    </div>
  </div>`;
}

const isVisible = (map: L.Map) => map.getContainer().clientWidth > 0;

export default function PharmacyMapInner({
  points,
  user,
  selectedId,
  onSelect,
  className,
}: PharmacyMapProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());

  // Latest props for long-lived listeners (resize observer, marker clicks).
  // Declared first, so it runs before the effects below in every commit.
  const latest = useRef({ points, user, selectedId, onSelect, router });
  useEffect(() => {
    latest.current = { points, user, selectedId, onSelect, router };
  });

  // Callers may build `points` anew on every render; key the effects on the
  // content instead, so a click doesn't rebuild the pins and close a popup.
  const pointsKey = points
    .map((p) => [p.id, p.latitude, p.longitude, p.status, p.label, p.name, p.popupDetail, p.href].join("~"))
    .join("|");
  const userKey = user ? `${user.latitude},${user.longitude}` : "";

  // 1) Create the map; remove it on clean-up. Runs again on every show.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const markers = markersRef.current;

    const map = L.map(container, { center: PILOT_CENTER, zoom: 12, scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    // "View pharmacy" links inside popups navigate without a full page reload.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[data-internal]");
      if (!link) return;
      event.preventDefault();
      latest.current.router.push(link.getAttribute("href")!);
    };
    container.addEventListener("click", onClick);

    // Re-measure when revealed (the phone List/Map switch hides it with display:none).
    let wasHidden = !isVisible(map);
    const observer = new ResizeObserver(() => {
      if (mapRef.current !== map) return;
      map.invalidateSize();
      const hidden = !isVisible(map);
      if (wasHidden && !hidden) showCurrent(map, latest.current);
      wasHidden = hidden;
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      container.removeEventListener("click", onClick);
      markers.clear();
      mapRef.current = null;
      map.off();
      map.stop();
      map.remove();
    };
  }, []);

  // 2) Pins (and the "you are here" dot). Rebuilt when the set of points changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const { points, user } = latest.current;
    const group = L.layerGroup().addTo(map);
    const markers = markersRef.current;
    markers.clear();
    for (const point of points) {
      const marker = L.marker([point.latitude, point.longitude], {
        icon: pinIcon(point, point.id === latest.current.selectedId),
        title: point.name,
        alt: point.name,
        keyboard: true,
      })
        .bindPopup(popupHtml(point))
        .on("click", () => latest.current.onSelect?.(point.id))
        .addTo(group);
      markers.set(point.id, marker);
    }
    if (user) {
      L.marker([user.latitude, user.longitude], { icon: userIcon, title: "Your location", interactive: false }).addTo(group);
    }
    if (isVisible(map)) fitAll(map, points, user);

    return () => {
      markers.clear();
      if (mapRef.current === map) group.remove();
    };
  }, [pointsKey, userKey]);

  // 3) Highlight the selected pin and fly to it.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const { points } = latest.current;
    for (const point of points) {
      markersRef.current.get(point.id)?.setIcon(pinIcon(point, point.id === selectedId));
    }
    const target = points.find((p) => p.id === selectedId);
    if (target && isVisible(map)) {
      map.flyTo([target.latitude, target.longitude], Math.max(map.getZoom(), 15));
    }
  }, [selectedId, pointsKey]);

  return <div ref={containerRef} className={className} style={{ height: "100%", width: "100%" }} />;
}

function fitAll(map: L.Map, points: MapPoint[], user: PharmacyMapProps["user"]) {
  const coords: L.LatLngTuple[] = points.map((p) => [p.latitude, p.longitude]);
  if (user) coords.push([user.latitude, user.longitude]);
  if (coords.length === 0) return;
  if (coords.length === 1) map.setView(coords[0], 16);
  else map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 16 });
}

function showCurrent(
  map: L.Map,
  { points, user, selectedId }: Pick<PharmacyMapProps, "points" | "user" | "selectedId">,
) {
  const selected = points.find((p) => p.id === selectedId);
  if (selected) map.setView([selected.latitude, selected.longitude], Math.max(map.getZoom(), 15));
  else fitAll(map, points, user);
}
