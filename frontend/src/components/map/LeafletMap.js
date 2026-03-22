"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { API_URL } from "@/lib/api";

const CA_US_ROUTES = [
  { name: "Vancouver to Seattle", coords: [
    [49.28, -123.12],
    [47.61, -122.33],
  ]},
  { name: "Vancouver to Los Angeles", coords: [
    [49.28, -123.12],
    [33.73, -118.26],
  ]},
  { name: "Halifax to New York", coords: [
    [44.65, -63.57],
    [40.65, -74.01],
  ]},
  { name: "Montreal to New York", coords: [
    [45.51, -73.55],
    [40.65, -74.01],
  ]},
  { name: "Toronto to Chicago", coords: [
    [43.7, -79.42],
    [41.88, -87.63],
  ]},
];

export default function LeafletMap() {
  const [vessels, setVessels] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/marine-traffic/vessels/map`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setVessels(data.slice(0, 50));
      })
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <div className="w-full">
      {err && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
          Map data: configure MARINE_TRAFFIC_API_KEY on the backend for live vessels.
        </p>
      )}
      <MapContainer
        center={[45, -90]}
        zoom={4}
        style={{ height: "500px", width: "100%", borderRadius: "12px" }}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {CA_US_ROUTES.map((route) => (
          <Polyline
            key={route.name}
            positions={route.coords}
            color="#3b82f6"
            weight={2}
            opacity={0.6}
            dashArray="8 4"
          />
        ))}
        {vessels.map((v, i) => (
          <CircleMarker key={i} center={[v.lat, v.lng]} radius={6} color="#f59e0b">
            <Popup>{v.name || "Vessel"}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
