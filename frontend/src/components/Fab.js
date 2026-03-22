"use client";

import Link from "next/link";

export default function Fab() {
  return (
    <Link
      href="/process-visualizer"
      className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary-fixed shadow-[0_20px_40px_rgba(0,0,0,0.45)] transition-all hover:scale-110 active:scale-95"
      aria-label="Start guided trade flow"
    >
      <span className="material-symbols-outlined text-3xl">add</span>
    </Link>
  );
}
