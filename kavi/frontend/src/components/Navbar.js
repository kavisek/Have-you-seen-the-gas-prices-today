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
    <nav className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center gap-8">
        <Link href="/" className="text-lg font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Export<span className="text-red-600">Min</span><span className="text-zinc-900 dark:text-white">Maxer</span>
        </Link>
        <div className="flex items-center gap-6">
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
        </div>
        <button
          onClick={toggle}
          className="ml-auto text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors text-lg"
          aria-label="Toggle light/dark mode"
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
