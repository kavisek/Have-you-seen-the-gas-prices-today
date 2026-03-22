"use client";

import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";
import { SavingsHero } from "@/components/savings/SavingsHero";
import { SavingsTable } from "@/components/savings/SavingsTable";
import { ShippingRoutes } from "@/components/map/ShippingRoutes";

export default function Home() {
  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-6 py-10 w-full space-y-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
            Stop paying $450/hr for what takes seconds.
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            TariffIQ helps Canadian SMEs classify products, check USMCA origin, and explore duty savings — with
            transparent math and export-ready documents.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/classify"
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              Classify my product
            </Link>
            <Link
              href="/savings"
              className="px-5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-sm transition-colors"
            >
              See savings calculator
            </Link>
          </div>
        </section>

        <SavingsHero totalSaved={4800} hoursFreed={10.5} />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Shipping lanes & vessels</h2>
          <p className="text-sm text-zinc-500">
            Common Canada–US lanes (backend can add live vessels when Marine Traffic is configured).
          </p>
          <ShippingRoutes />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Attorney vs TariffIQ</h2>
          <SavingsTable />
        </section>
      </div>
    </PageTransition>
  );
}
