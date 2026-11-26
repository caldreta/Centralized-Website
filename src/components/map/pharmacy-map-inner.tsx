"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { directionsUrl } from "@/lib/pharmalink/format";

import type { MapPoint, PharmacyMapProps } from "./types";

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

/**
 * Keeps the view sensible: fits all pins when the set changes, flies to the
 * selected pin, and re-measures when the map is revealed (the phone List/Map
 * switch hides it with display:none, which Leaflet sees as a 0×0 map).
 */
function MapController({
  points,
  user,
  selectedId,
}: Pick<PharmacyMapProps, "points" | "user" | "selectedId">) {
  const map = useMap();
  const key =
    points.map((p) => p.id).join(",") + (user ? `|${user.latitude},${user.longitude}` : "");
  const selected = points.find((p) => p.id === selectedId) ?? null;

  const isVisible = useCallback(() => map.getContainer().clientWidth > 0, [map]);

  const fitAll = useCallback(() => {
    const coords: L.LatLngTuple[] = points.map((p) => [p.latitude, p.longitude]);
    if (user) coords.push([user.latitude, user.longitude]);
    if (coords.length === 0) return;
    if (coords.length === 1) map.setView(coords[0], 16);
    else map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 16 });
    // Refit only when the set of points changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);

  const showCurrent = useCallback(() => {
    if (selected) map.setView([selected.latitude, selected.longitude], Math.max(map.getZoom(), 15));
    else fitAll();
  }, [map, selected, fitAll]);

  // Latest "what should be on screen", for the resize observer below.
  const showCurrentRef = useRef(showCurrent);
  useEffect(() => {
    showCurrentRef.current = showCurrent;
  }, [showCurrent]);

  useEffect(() => {
    if (isVisible()) fitAll();
  }, [fitAll, isVisible]);

  useEffect(() => {
    if (selected && isVisible()) {
      map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 15));
    }
  }, [map, selected, isVisible]);

  useEffect(() => {
    const el = map.getContainer();
    let wasHidden = el.clientWidth === 0;
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
      const hidden = el.clientWidth === 0;
      if (wasHidden && !hidden) showCurrentRef.current();
      wasHidden = hidden;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

export default function PharmacyMapInner({
  points,
  user,
  selectedId,
  onSelect,
  className,
}: PharmacyMapProps) {
  const markers = useMemo(
    () =>
      points.map((point) => (
        <Marker
          key={point.id}
          position={[point.latitude, point.longitude]}
          icon={pinIcon(point, point.id === selectedId)}
          title={point.name}
          alt={point.name}
          eventHandlers={onSelect ? { click: () => onSelect(point.id) } : undefined}
        >
          <Popup>
            <div className="min-w-44 space-y-1.5">
              <p className="text-sm font-semibold">{point.name}</p>
              {point.popupDetail && <p className="text-xs">{point.popupDetail}</p>}
              <div className="flex gap-3 pt-0.5 text-xs font-medium">
                <a
                  href={directionsUrl(point)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Directions
                </a>
                {point.href && (
                  <Link href={point.href} className="text-primary underline">
                    View pharmacy
                  </Link>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      )),
    [points, selectedId, onSelect],
  );

  return (
    <MapContainer
      center={PILOT_CENTER}
      zoom={12}
      scrollWheelZoom={false}
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {markers}
      {user && (
        <Marker position={[user.latitude, user.longitude]} icon={userIcon} title="Your location" />
      )}
      <MapController points={points} user={user} selectedId={selectedId} />
    </MapContainer>
  );
}
