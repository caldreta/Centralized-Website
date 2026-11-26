"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

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

function FitToPoints({ points, user }: Pick<PharmacyMapProps, "points" | "user">) {
  const map = useMap();
  const key = points.map((p) => p.id).join(",") + (user ? `|${user.latitude},${user.longitude}` : "");
  useEffect(() => {
    const coords: L.LatLngTuple[] = points.map((p) => [p.latitude, p.longitude]);
    if (user) coords.push([user.latitude, user.longitude]);
    if (coords.length === 0) return;
    if (coords.length === 1) {
      map.setView(coords[0], 16);
    } else {
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 16 });
    }
    // Refit only when the set of points changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

function FlyToSelected({ points, selectedId }: Pick<PharmacyMapProps, "points" | "selectedId">) {
  const map = useMap();
  const target = points.find((p) => p.id === selectedId);
  useEffect(() => {
    if (target) map.flyTo([target.latitude, target.longitude], Math.max(map.getZoom(), 15));
  }, [map, target]);
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
            <div className="space-y-1">
              <p className="font-semibold">{point.name}</p>
              {point.popupDetail && <p className="text-xs">{point.popupDetail}</p>}
              {point.href && (
                <Link href={point.href} className="text-xs font-medium text-primary underline">
                  View pharmacy
                </Link>
              )}
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
      <FitToPoints points={points} user={user} />
      <FlyToSelected points={points} selectedId={selectedId} />
    </MapContainer>
  );
}
