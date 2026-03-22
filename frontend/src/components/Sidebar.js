"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/hs-codes", label: "HS Codes", icon: "grid_view" },
  { href: "/process-visualizer", label: "Process Visualizer", icon: "account_tree" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-4 top-24 z-40 hidden h-[calc(100dvh-7rem)] w-72 flex-col rounded-[2rem] bg-surface-container p-6 shadow-[0_20px_40px_rgba(0,0,0,0.3)] lg:flex"
      aria-label="Primary"
    >
      <div className="flex items-center gap-4 px-2 py-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-on-primary">
          <span className="material-symbols-outlined fill text-[22px]">local_shipping</span>
        </div>
        <div>
          <p className="text-lg font-extrabold leading-tight text-primary">Trade flow</p>
          <p className="text-xs font-medium text-on-surface-variant">Export workspace</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {items.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 rounded-full px-6 py-4 text-sm font-medium transition-transform duration-200 hover:scale-[1.02] ${
                active
                  ? "bg-surface-container-highest font-bold text-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-highest/50"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-outline-variant/20 pt-6">
        <Link
          href="/process-visualizer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-dim py-4 text-sm font-bold text-on-primary-fixed shadow-[0_4px_12px_rgba(0,105,122,0.4)] transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[22px]">add</span>
          Start guided flow
        </Link>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href="https://international.canada.ca/en/services/business/trade/tariffs-regulations"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center py-3 text-on-surface-variant transition-colors hover:text-primary"
          >
            <span className="material-symbols-outlined text-[22px]">help_outline</span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-tighter">Resources</span>
          </a>
          <Link
            href="/"
            className="flex flex-col items-center py-3 text-on-surface-variant transition-colors hover:text-primary"
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-tighter">Search</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
