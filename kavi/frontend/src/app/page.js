"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <>
      <main className="relative z-10 min-h-screen overflow-hidden px-4 pb-20 pt-32 retro-grid md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
          <div className="mb-8 inline-block border-2 border-tertiary bg-surface-container-high px-4 py-1">
            <span className="animate-pulse font-pixel text-[10px] text-tertiary">
              SYSTEM ONLINE: TARIFF SCHEDULE 2026
            </span>
          </div>

          <h1 className="font-headline mb-4 text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-8xl">
            Minimize <span className="text-primary italic">fees</span>.
            <br />
            Maximize <span className="text-secondary-fixed italic">output</span>.
          </h1>
          <p className="mb-12 max-w-2xl font-pixel text-xs uppercase leading-relaxed text-on-surface-variant opacity-80">
            Latest cargo logistics protocols enabled. HS search, export guidance, and Canadian tariff data.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-3xl">
            <div className="border-4 border-secondary bg-surface-container-lowest p-1 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <div className="group flex items-center border-2 border-outline-variant bg-background px-4 py-4 transition-colors focus-within:border-secondary-fixed">
                <span className="mr-4 font-pixel text-secondary-fixed">&gt;</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search cargo id or destination..."
                  className="w-full border-none bg-transparent font-pixel text-sm uppercase text-secondary-fixed ring-0 outline-none placeholder:text-outline-variant focus:ring-0"
                  autoFocus
                />
                <span className="ml-2 h-6 w-3 animate-pulse bg-secondary-fixed" />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="submit"
                className="font-headline border-2 border-primary bg-primary px-6 py-2 text-sm font-bold uppercase text-on-primary shadow-[4px_4px_0px_0px_rgba(81,0,81,1)] active:translate-y-0.5 active:shadow-none"
              >
                Run query
              </button>
              <button
                type="button"
                onClick={() => {
                  const examples = ["softwood lumber", "canola oil", "live cattle", "aluminum ingots"];
                  setQuery(examples[Math.floor(Math.random() * examples.length)]);
                }}
                className="font-headline border-2 border-outline-variant px-6 py-2 text-sm font-bold uppercase text-on-surface hover:border-tertiary hover:text-tertiary"
              >
                Random SKU
              </button>
            </div>
          </form>

          <div className="mt-20 grid w-full grid-cols-1 gap-6 md:grid-cols-4">
            <Link
              href="/hs-codes"
              className="group relative border-2 border-primary bg-surface-container p-6 text-left transition-colors duration-0 hover:bg-primary"
            >
              <span className="absolute -top-3 -right-3 border-2 border-background bg-primary px-2 py-1 font-pixel text-[8px] text-background">
                NEW
              </span>
              <span className="material-symbols-outlined mb-4 block text-primary group-hover:text-background">
                package_2
              </span>
              <h3 className="font-headline mb-2 font-bold uppercase text-white group-hover:text-background">HS cargo</h3>
              <p className="font-pixel text-xs leading-tight text-on-surface-variant group-hover:text-background">
                2026 tariff schedule search
              </p>
            </Link>
            <Link
              href="/search"
              className="group border-2 border-secondary-fixed bg-surface-container p-6 text-left transition-colors duration-0 hover:bg-secondary-fixed"
            >
              <span className="material-symbols-outlined mb-4 block text-secondary-fixed group-hover:text-background">
                rocket_launch
              </span>
              <h3 className="font-headline mb-2 font-bold uppercase text-white group-hover:text-background">Export AI</h3>
              <p className="font-pixel text-xs leading-tight text-on-surface-variant group-hover:text-background">
                Live uplink via secure channel
              </p>
            </Link>
            <Link
              href="/hs-codes"
              className="group border-2 border-tertiary bg-surface-container p-6 text-left transition-colors duration-0 hover:bg-tertiary"
            >
              <span className="material-symbols-outlined mb-4 block text-tertiary group-hover:text-background">
                monetization_on
              </span>
              <h3 className="font-headline mb-2 font-bold uppercase text-white group-hover:text-background">Tax logic</h3>
              <p className="font-pixel text-xs leading-tight text-on-surface-variant group-hover:text-background">
                MFN, CUSMA, GPT columns
              </p>
            </Link>
            <Link
              href="/hs-guide"
              className="group relative border-2 border-error bg-surface-container p-6 text-left transition-colors duration-0 hover:bg-error"
            >
              <span className="absolute -top-3 -right-3 border-2 border-background bg-error px-2 py-1 font-pixel text-[8px] text-background">
                INFO
              </span>
              <span className="material-symbols-outlined mb-4 block text-error group-hover:text-background">terminal</span>
              <h3 className="font-headline mb-2 font-bold uppercase text-white group-hover:text-background">HS guide</h3>
              <p className="font-pixel text-xs leading-tight text-on-surface-variant group-hover:text-background">
                Decode columns and structure
              </p>
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex w-full flex-col items-center gap-6 border-t-4 border-tertiary bg-background px-4 py-12 shadow-[0_-8px_0px_0px_rgba(42,229,0,0.2)]">
        <div className="font-headline text-3xl font-bold uppercase tracking-widest text-tertiary">ExportMinMaxer</div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          <Link
            href="/hs-codes"
            className="p-1 font-pixel text-[10px] uppercase text-tertiary underline transition-colors hover:bg-tertiary hover:text-white"
          >
            High scores
          </Link>
          <Link
            href="/about"
            className="p-1 font-pixel text-[10px] uppercase text-tertiary opacity-80 transition-colors hover:bg-tertiary hover:text-white"
          >
            System status
          </Link>
          <Link
            href="/hs-guide"
            className="p-1 font-pixel text-[10px] uppercase text-tertiary opacity-80 transition-colors hover:bg-tertiary hover:text-white"
          >
            Legal.bat
          </Link>
        </div>
        <div className="animate-pulse font-pixel text-[10px] uppercase text-tertiary">
          2026 ExportMinMaxer — insert coin to continue
        </div>
      </footer>
    </>
  );
}
