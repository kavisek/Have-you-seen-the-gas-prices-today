"use client";

import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import("./LeafletMap"), { ssr: false });

export function ShippingRoutes() {
  return <MapWithNoSSR />;
}
