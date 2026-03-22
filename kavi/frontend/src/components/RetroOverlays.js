"use client";

import { useEffect, useState } from "react";

function fract(n) {
  return n - Math.floor(n);
}

function crawlVarsForIndex(index) {
  const d = fract(Math.sin(index * 99.11 + 12.3) * 88321.1234);
  const e = fract(Math.sin(index * 33.7 + 4.2) * 44111.9);
  const duration = (18 + d * 28).toFixed(2);
  const delay = (-(e * 35)).toFixed(2);
  return {
    "--crawl-duration": `${duration}s`,
    "--crawl-delay": `${delay}s`,
  };
}

function randomCrawlVars() {
  const duration = (18 + Math.random() * 28).toFixed(2);
  const delay = (-Math.random() * 35).toFixed(2);
  return {
    "--crawl-duration": `${duration}s`,
    "--crawl-delay": `${delay}s`,
  };
}

const STYLE_CLASSES = [
  "border-primary text-primary shadow-[4px_4px_0px_0px_rgba(255,171,243,0.3)]",
  "border-secondary-fixed text-secondary-fixed shadow-[4px_4px_0px_0px_rgba(0,251,251,0.3)]",
  "border-tertiary text-tertiary shadow-[4px_4px_0px_0px_rgba(42,229,0,0.3)]",
  "border-error text-error shadow-[4px_4px_0px_0px_rgba(255,180,171,0.3)]",
];

const GOODS = [
  { role: "EXP", name: "SOFTWOOD LUMBER" },
  { role: "IMP", name: "PASSENGER VEHICLES" },
  { role: "EXP", name: "CANOLA SEED" },
  { role: "IMP", name: "SMARTPHONES" },
  { role: "EXP", name: "WHEAT" },
  { role: "IMP", name: "OFFICE MACHINERY" },
  { role: "EXP", name: "POTASH" },
  { role: "IMP", name: "INDUSTRIAL MACHINERY" },
  { role: "EXP", name: "CRUDE OIL" },
  { role: "IMP", name: "COFFEE" },
  { role: "EXP", name: "MAPLE SYRUP" },
  { role: "IMP", name: "MEDICAL DEVICES" },
  { role: "EXP", name: "ATLANTIC SALMON" },
  { role: "IMP", name: "TEXTILES" },
  { role: "EXP", name: "BEEF CUTS" },
  { role: "IMP", name: "SEMICONDUCTORS" },
  { role: "EXP", name: "ALUMINUM INGOTS" },
  { role: "IMP", name: "FRESH PRODUCE" },
  { role: "EXP", name: "BLUEBERRIES" },
  { role: "IMP", name: "LAPTOPS" },
  { role: "EXP", name: "NATURAL GAS" },
  { role: "IMP", name: "HOUSEHOLD GOODS" },
  { role: "EXP", name: "ICE WINE" },
  { role: "IMP", name: "PLASTICS RESIN" },
  { role: "EXP", name: "SOYBEANS" },
  { role: "IMP", name: "AUTO PARTS" },
  { role: "EXP", name: "NICKEL MATTE" },
  { role: "IMP", name: "FURNITURE" },
  { role: "EXP", name: "LOBSTER" },
  { role: "IMP", name: "PHARMACEUTICALS" },
  { role: "EXP", name: "PULSES" },
  { role: "IMP", name: "STEEL PRODUCTS" },
  { role: "EXP", name: "PORK" },
  { role: "IMP", name: "TOYS" },
  { role: "EXP", name: "AIRCRAFT PARTS" },
  { role: "IMP", name: "BATTERIES" },
];

function buildTags() {
  const n = GOODS.length;
  const span = n > 1 ? 86 / (n - 1) : 0;
  return GOODS.map((g, i) => {
    const topPct = Math.min(5 + Math.round(i * span), 91);
    return {
      text: `> ${g.role} ${g.name}`,
      className: STYLE_CLASSES[i % STYLE_CLASSES.length],
      rtl: i % 2 === 1,
      top: `${topPct}%`,
    };
  });
}

const TAGS = buildTags();

export default function RetroOverlays() {
  const tagCount = TAGS.length;
  const [crawlStyles, setCrawlStyles] = useState(() =>
    Array.from({ length: tagCount }, (_, i) => crawlVarsForIndex(i)),
  );

  useEffect(() => {
    setCrawlStyles(Array.from({ length: tagCount }, () => randomCrawlVars()));
  }, [tagCount]);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-20 scanline" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        {TAGS.map((t, i) => (
          <div
            key={`float-${i}-${t.text}`}
            className={`floating-tag-crawl border-2 bg-background/80 p-2 font-pixel text-[8px] ${t.rtl ? "floating-tag-crawl--rtl" : "floating-tag-crawl--ltr"} ${t.className}`}
            style={{
              ...crawlStyles[i],
              top: t.top,
            }}
          >
            {t.text}
          </div>
        ))}
      </div>
    </>
  );
}
