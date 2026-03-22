"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SavingsNavBadge } from "@/components/savings/SavingsNavBadge";

const links = [
  { href: "/", label: "Home" },
  { href: "/classify", label: "Classify" },
  { href: "/usmca", label: "USMCA" },
  { href: "/engineer", label: "Engineer" },
  { href: "/documents", label: "Documents" },
  { href: "/map", label: "Map" },
  { href: "/savings", label: "Savings" },
  { href: "/hs-codes", label: "HS Codes" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-4 justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Tariff<span className="text-blue-500">IQ</span>
        </Link>
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${
                pathname === href
                  ? "text-blue-500 font-medium"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {label}
            </Link>
          ))}
          <SavingsNavBadge />
        </div>
      </div>
    </nav>
  );
}
