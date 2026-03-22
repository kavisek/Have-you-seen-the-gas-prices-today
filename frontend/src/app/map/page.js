"use client";

import { PageTransition } from "@/components/PageTransition";
import { ShippingRoutes } from "@/components/map/ShippingRoutes";

export default function MapPage() {
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-4">
        <h1 className="text-2xl font-semibold">Shipping map</h1>
        <p className="text-sm text-zinc-500">
          Canada–US lanes with optional vessel positions from the Marine Traffic integration.
        </p>
        <ShippingRoutes />
      </div>
    </PageTransition>
  );
}
