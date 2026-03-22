"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <section className="mx-auto mb-16 max-w-4xl text-center">
        <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-on-surface md:text-6xl">
          Ship smarter,
          <br />
          <span className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
            ExportMinMaxer.
          </span>
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          Find permits, HS codes, and requirements to export products. Search once, then dive into tariff
          data and a guided compliance flow.
        </p>

        <form onSubmit={handleSearch} className="group relative mx-auto max-w-3xl">
          <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center">
            <span className="material-symbols-outlined text-3xl text-primary">search</span>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a product to export (e.g. softwood lumber)"
            className="w-full rounded-2xl border-none bg-surface-container-highest py-6 pl-16 pr-36 text-lg text-on-surface shadow-2xl outline-none transition-all duration-300 placeholder:text-outline focus:ring-2 focus:ring-primary/40 md:py-8 md:text-xl md:pr-40"
            autoFocus
          />
          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const examples = ["softwood lumber", "canola oil", "live cattle", "aluminum ingots"];
                setQuery(examples[Math.floor(Math.random() * examples.length)]);
              }}
              className="hidden rounded-xl border border-outline-variant/30 px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary/40 hover:text-primary md:inline-flex"
            >
              Lucky
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-3 font-bold text-on-primary-fixed transition-colors hover:bg-primary-dim md:px-6 md:py-4"
            >
              Go
            </button>
          </div>
        </form>
      </section>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-container-low p-8 md:col-span-2">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl transition-colors group-hover:bg-primary/20" />
          <div className="relative z-10">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">
                  Workspace
                </span>
                <h3 className="text-3xl font-bold text-on-surface">Export readiness</h3>
              </div>
              <span className="material-symbols-outlined rounded-2xl bg-primary-container p-3 text-primary">
                insights
              </span>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-on-surface-variant">HS lookup</p>
                <p className="text-4xl font-extrabold text-on-surface">Live</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-on-surface-variant">Tariff data</p>
                <p className="text-4xl font-extrabold text-on-surface">2026</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-on-surface-variant">Guided steps</p>
                <p className="text-4xl font-extrabold text-secondary">7</p>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-8 flex items-center justify-between border-t border-outline-variant/20 pt-6">
            <p className="text-sm text-on-surface-variant">Jump into data or a walkthrough anytime.</p>
            <Link
              href="/hs-codes"
              className="flex items-center gap-1 font-bold text-primary transition-all hover:gap-2"
            >
              Open HS table
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl bg-surface-container-highest p-8">
          <div className="mb-6">
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Shortcuts
            </span>
            <h3 className="text-2xl font-bold text-on-surface">Tools</h3>
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <Link
              href="/hs-codes"
              className="flex cursor-pointer items-center gap-4 rounded-xl bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary-container text-on-tertiary-container">
                <span className="material-symbols-outlined text-sm">grid_view</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-on-surface">HS code browser</p>
                <p className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
                  Tariff schedule
                </p>
              </div>
            </Link>
            <Link
              href="/process-visualizer"
              className="flex cursor-pointer items-center gap-4 rounded-xl bg-surface-container-lowest p-4 transition-colors hover:bg-surface-container"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
                <span className="material-symbols-outlined text-sm">account_tree</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-on-surface">Process visualizer</p>
                <p className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
                  Guided flow
                </p>
              </div>
            </Link>
          </div>
          <Link
            href="/process-visualizer"
            className="mt-6 w-full rounded-2xl border-2 border-primary/20 py-3 text-center text-sm font-bold text-primary transition-colors hover:bg-primary/10"
          >
            Browse all steps
          </Link>
        </div>

        <Link
          href="/process-visualizer"
          className="flex aspect-square flex-col justify-between rounded-2xl bg-gradient-to-br from-secondary-container to-secondary-dim p-8 text-on-secondary-container md:aspect-auto"
        >
          <div>
            <span className="material-symbols-outlined fill mb-4 text-4xl">auto_awesome</span>
            <h3 className="mb-2 text-2xl font-extrabold leading-tight text-white">
              Guided
              <br />
              trade flow
            </h3>
            <p className="text-sm leading-relaxed text-white/90">
              Walk through classification, tariffs, controls, and paperwork with clear checklists.
            </p>
          </div>
          <span className="mt-6 inline-flex items-center justify-center rounded-xl bg-white/15 py-4 text-center text-sm font-bold text-white shadow-lg backdrop-blur-sm transition-all active:scale-95">
            Start flow
          </span>
        </Link>

        <div className="grid grid-cols-1 gap-8 md:col-span-2 sm:grid-cols-2">
          <a
            href="https://international.canada.ca/en/services/business/trade/tariffs-regulations"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-6 rounded-2xl bg-surface-container-low p-8 transition-colors hover:bg-surface-container"
          >
            <div className="rounded-2xl bg-surface-container-lowest p-4 text-primary shadow-sm">
              <span className="material-symbols-outlined text-3xl">policy</span>
            </div>
            <div>
              <h4 className="mb-1 text-lg font-bold text-on-surface">Official trade hub</h4>
              <p className="mb-4 text-sm text-on-surface-variant">
                Tariffs, sanctions, controls, and agreements from the Government of Canada.
              </p>
              <span className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
                Open Canada.ca
              </span>
            </div>
          </a>
          <div className="flex items-start gap-6 rounded-2xl bg-surface-container-low p-8 transition-colors hover:bg-surface-container">
            <div className="rounded-2xl bg-surface-container-lowest p-4 text-tertiary shadow-sm">
              <span className="material-symbols-outlined text-3xl">description</span>
            </div>
            <div>
              <h4 className="mb-1 text-lg font-bold text-on-surface">Search products</h4>
              <p className="mb-4 text-sm text-on-surface-variant">
                Use the bar above to look up export context for a product (demo routes to search).
              </p>
              <span className="text-xs font-bold uppercase tracking-widest text-tertiary">Try a query</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-20 max-w-6xl border-t border-outline-variant/20 py-12">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-xs">
            <p className="mb-4 text-xl font-bold text-primary">ExportMinMaxer</p>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              A focused surface for Canadian exporters exploring HS data and compliance steps—not a substitute
              for professional advice.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface">App</p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li>
                  <Link href="/hs-codes" className="transition-colors hover:text-primary">
                    HS Codes
                  </Link>
                </li>
                <li>
                  <Link href="/process-visualizer" className="transition-colors hover:text-primary">
                    Process Visualizer
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface">Resources</p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                <li>
                  <a
                    href="https://international.canada.ca/en/services/business/trade/tariffs-regulations"
                    className="transition-colors hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Tariffs and regulations
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/menu-eng.html"
                    className="transition-colors hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CBSA tariff tools
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-12 text-[10px] font-bold uppercase tracking-[0.2em] text-outline">
          Demo workspace — verify requirements with official sources.
        </p>
      </footer>
    </div>
  );
}
