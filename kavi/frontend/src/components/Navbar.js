"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

const links = [
  { href: "/", label: "Home" },
  { href: "/hs-codes", label: "HS Codes" },
  { href: "/hs-guide", label: "HS Guide" },
  { href: "/tariff-intelligence", label: "Tariff Intelligence" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { dark, toggle } = useTheme();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const current = links.findIndex((l) => l.href === pathname);
      if (e.key === "ArrowRight" && current < links.length - 1) {
        router.push(links[current + 1].href);
      } else if (e.key === "ArrowLeft" && current > 0) {
        router.push(links[current - 1].href);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname, router]);

  return (
    <nav className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b-4 border-primary bg-background px-4 shadow-[4px_4px_0px_0px_rgba(255,171,243,1)] md:px-8">
      <Link
        href="/"
        className="font-headline text-xl font-black uppercase tracking-widest text-primary md:text-2xl"
      >
        ExportMinMaxer
      </Link>
      <div className="hidden items-center gap-6 md:flex md:gap-10">
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`font-headline px-2 uppercase tracking-tighter transition-colors duration-0 hover:bg-primary hover:text-background ${
                active
                  ? "border-b-2 border-primary pb-1 text-primary"
                  : "text-secondary opacity-70"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className="font-headline border-2 border-outline-variant px-2 py-1 text-[10px] font-bold uppercase text-on-surface-variant hover:border-primary hover:text-primary"
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
        >
          {dark ? "LGT" : "DRK"}
        </button>
        <Link
          href="/search"
          className="font-headline bg-primary px-4 py-2 text-sm font-bold uppercase text-on-primary shadow-[4px_4px_0px_0px_rgba(81,0,81,1)] transition-transform active:translate-y-0.5 active:shadow-none md:px-6"
        >
          Query
        </Link>
      </div>
    </nav>
  );
}
