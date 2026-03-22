"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/hs-codes", label: "HS Codes" },
  { href: "/process-visualizer", label: "Process Visualizer" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="glass-effect fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b border-outline-variant/10 bg-surface/80 px-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] lg:px-12">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-bold tracking-tight lg:text-2xl">
          <span className="text-primary">Export</span>
          <span className="text-on-surface">Min</span>
          <span className="text-secondary">Max</span>
          <span className="text-tertiary">er</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`border-b-2 pb-1 text-sm transition-colors duration-300 ${
                  active
                    ? "border-primary font-semibold text-primary"
                    : "border-transparent font-medium text-on-surface-variant hover:text-primary"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-4 lg:gap-6">
        <button
          type="button"
          className="text-on-surface-variant transition-colors hover:text-primary"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[26px]">notifications</span>
        </button>
        <button
          type="button"
          className="hidden text-on-surface-variant transition-colors hover:text-primary sm:block"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-[26px]">settings</span>
        </button>
        <div
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-surface-container bg-primary-container text-sm font-bold text-on-primary-container"
          aria-hidden
        >
          EM
        </div>
      </div>
    </nav>
  );
}
