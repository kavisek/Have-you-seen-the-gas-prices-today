"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const RESOURCE_URL =
  "https://international.canada.ca/en/services/business/trade/tariffs-regulations";

const STEPS = [
  {
    id: "scope",
    title: "Map your trade move",
    subtitle: "Start with direction, partner country, and what you are moving",
    body:
      "Clarify whether you are importing into Canada or exporting from Canada, who the counterparty is, and how goods will move (air, ocean, truck, courier). That choice drives which agencies, permits, and data elements apply later.",
    icon: "compass",
    hubHint: "Use the hub to see how tariffs, sanctions, and controls fit together for Canadian traders.",
    checklist: [
      { id: "c1", label: "Transaction type recorded (import / export / transit)" },
      { id: "c2", label: "Buyer or seller jurisdiction identified" },
      { id: "c3", label: "Intended shipping route and incoterms drafted" },
    ],
  },
  {
    id: "hs",
    title: "Classify with the Harmonized System",
    subtitle: "Tariff classification drives duty, reporting, and control lists",
    body:
      "Every product needs a consistent HS-based classification for customs declarations. Start with product composition, use, and the official classification resources linked from the Government of Canada trade pages—not guesses from marketplaces.",
    icon: "grid",
    hubHint: "Open Tariff information and Harmonized System codes from the same hub.",
    checklist: [
      { id: "h1", label: "Technical specs, materials, and end-use captured" },
      { id: "h2", label: "Draft HS code noted with rationale" },
      { id: "h3", label: "Classification reviewed against official guidance" },
    ],
  },
  {
    id: "tariff",
    title: "Read the Canadian Customs Tariff",
    subtitle: "Duty rates, units of measure, and trade-program columns",
    body:
      "Once classification is firm, use the Customs Tariff to see applicable rates and program columns (for example preferential columns where trade agreements apply). Keep a screenshot or printout of the tariff line you relied on.",
    icon: "book",
    hubHint: "Follow Canadian customs tariff from the tariffs and regulations landing page.",
    checklist: [
      { id: "t1", label: "Tariff item and statistical suffix confirmed" },
      { id: "t2", label: "Unit of quantity matches CBSA expectations" },
      { id: "t3", label: "Applicable preferential program identified if any" },
    ],
  },
  {
    id: "controls",
    title: "Export and import controls",
    subtitle: "Permits, certificates, and policy notices when goods are controlled",
    body:
      "Some goods need permits or registrations regardless of duty rate. Controlled technology, certain metals, cultural property, and strategic items may require pre-clearance. Build time for agency review into your timeline.",
    icon: "shield",
    hubHint: "Use Export and import controls on international.canada.ca from the hub.",
    checklist: [
      { id: "e1", label: "Product screened against control lists and notices" },
      { id: "e2", label: "Permit application package drafted if required" },
      { id: "e3", label: "Retention plan for permits and correspondence" },
    ],
  },
  {
    id: "sanctions",
    title: "Sanctions and restricted parties",
    subtitle: "Screen people, companies, and destinations",
    body:
      "Canadian sanctions can prohibit dealings outright or require specific licenses. Combine sanctions screening with your bank’s trade-compliance questions so financing is not delayed at shipment time.",
    icon: "flag",
    hubHint: "Review Canadian sanctions resources linked from the hub.",
    checklist: [
      { id: "s1", label: "Parties and banks screened against current lists" },
      { id: "s2", label: "Payment routes confirmed as permissible" },
      { id: "s3", label: "Escalation path defined if a match appears" },
    ],
  },
  {
    id: "agreements",
    title: "Trade agreements and origin",
    subtitle: "Preferential treatment needs proof, not assumptions",
    body:
      "Free-trade programs reduce duties when origin rules are met and documentation is complete. Collect supplier declarations, bills of materials, or certificates as required for the agreement you intend to claim.",
    icon: "handshake",
    checklist: [
      { id: "a1", label: "Applicable agreement short-listed" },
      { id: "a2", label: "Rule of origin assessed with suppliers" },
      { id: "a3", label: "Certificate or declaration template obtained" },
    ],
  },
  {
    id: "filing",
    title: "Declarations and recordkeeping",
    subtitle: "Commercial documents the border expects",
    body:
      "Customs filings bundle classification, valuation, origin, and control references. Maintain invoices, packing lists, permits, and correspondence for the retention period your advisors recommend so post-clearance audits are manageable.",
    icon: "folder",
    checklist: [
      { id: "f1", label: "Commercial invoice and packing list finalized" },
      { id: "f2", label: "CBSA / partner agency account access ready" },
      { id: "f3", label: "Broker or self-filer instructions aligned" },
    ],
  },
];

function StepIcon({ name, className }) {
  const common = `w-8 h-8 ${className || ""}`;
  switch (name) {
    case "compass":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2M3 12h2m14 0h2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.5 9.5-4 2-2 4 4-2 2-4z" />
        </svg>
      );
    case "grid":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" d="M4 5h4v4H4V5zm12 0h4v4h-4V5zM4 17h4v4H4v-4zm12 0h4v4h-4v-4z" />
        </svg>
      );
    case "book":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h4v16H6a2 2 0 01-2-2V6zm16-2a2 2 0 012 2v12a2 2 0 01-2 2h-4V4h4z" />
        </svg>
      );
    case "shield":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7l7-4z" />
        </svg>
      );
    case "flag":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v18M5 5h10l-2 3 2 3H5" />
        </svg>
      );
    case "handshake":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 14l-2 2H7l-3-3 2-2 2 2h2zm2-2l2-2h2l3 3-2 2-2-2h-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 10l2-2 4 4-2 2" />
        </svg>
      );
    default:
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h5l2 3h6l3-3h2M5 7v12a2 2 0 002 2h10a2 2 0 002-2V7" />
        </svg>
      );
  }
}

export default function ProcessVisualizerPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [checked, setChecked] = useState({});

  const step = STEPS[stepIndex];
  const progress = useMemo(
    () => ((stepIndex + 1) / STEPS.length) * 100,
    [stepIndex]
  );

  function toggleCheck(id) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goPrev() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  const stepChecks = step.checklist.map((c) => c.id);
  const completedInStep = stepChecks.filter((id) => checked[id]).length;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Guided flow</p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
          Process visualizer
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant">
          A visual walkthrough of what Canadian traders typically line up before filing—classification, tariff
          lines, controls, sanctions, agreements, and paperwork. Always confirm details with official
          Government of Canada guidance.
        </p>
        <a
          href={RESOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-dim"
        >
          Tariffs, rules and regulations (Canada.ca)
          <span className="material-symbols-outlined text-lg">open_in_new</span>
        </a>
      </header>

      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-on-surface-variant">
          <span>
            Step {stepIndex + 1} of {STEPS.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-tertiary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStepIndex(i)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                i === stepIndex
                  ? "bg-primary text-on-primary-fixed shadow-sm"
                  : i < stepIndex
                    ? "bg-primary-container/60 text-on-primary-container"
                    : "bg-surface-container-highest text-on-surface-variant"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  i === stepIndex
                    ? "bg-on-primary-fixed/15 text-on-primary-fixed"
                    : i < stepIndex
                      ? "bg-surface text-on-primary-container"
                      : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {i + 1}
              </span>
              <span className="hidden max-w-[8rem] truncate sm:inline">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <article className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-low shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
          <div className="relative flex h-40 items-end bg-gradient-to-br from-primary-container via-surface-container-high to-tertiary-container p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(136,225,248,0.35)_0%,transparent_55%)]" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface/20 text-on-primary-container ring-1 ring-primary/30 backdrop-blur-sm">
                <StepIcon name={step.icon} className="text-primary-fixed" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-on-surface">{step.title}</h2>
                <p className="text-sm text-on-surface-variant">{step.subtitle}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <p className="text-sm leading-relaxed text-on-surface">{step.body}</p>
            {step.hubHint && (
              <p className="border-l-2 border-primary pl-3 text-sm text-on-surface-variant">{step.hubHint}</p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={stepIndex === 0}
                className="rounded-xl border border-outline-variant/50 px-4 py-2 text-sm text-on-surface transition-colors hover:bg-surface-container-highest disabled:pointer-events-none disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={stepIndex === STEPS.length - 1}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary-fixed transition-colors hover:bg-primary-dim disabled:pointer-events-none disabled:opacity-40"
              >
                Next step
              </button>
              <Link
                href="/hs-codes"
                className="inline-flex items-center rounded-xl bg-surface-container-highest px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
              >
                Browse HS codes
              </Link>
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5">
            <h3 className="mb-1 text-sm font-semibold text-on-surface">Forms and prep checklist</h3>
            <p className="mb-4 text-xs text-on-surface-variant">
              Track what you still owe your file. Official PDFs and portals live on department sites linked from
              the hub—not here.
            </p>
            <ul className="space-y-3">
              {step.checklist.map((item) => (
                <li key={item.id}>
                  <label className="group flex cursor-pointer gap-3">
                    <input
                      type="checkbox"
                      checked={!!checked[item.id]}
                      onChange={() => toggleCheck(item.id)}
                      className="mt-0.5 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/40"
                    />
                    <span className="text-sm text-on-surface group-hover:text-primary">{item.label}</span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-on-surface-variant">
              {completedInStep}/{step.checklist.length} items checked for this step
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-highest/50 p-5">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              Quick links from the hub
            </h3>
            <ul className="space-y-2 text-sm text-primary">
              <li>
                <a href={RESOURCE_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Tariffs, rules and regulations (overview)
                </a>
              </li>
              <li>
                <a
                  href="https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/menu-eng.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  CBSA customs tariff tools
                </a>
              </li>
              <li>
                <a
                  href="https://www.international.gc.ca/controls-controles/index.aspx?lang=eng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Export and import controls (GAC)
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <footer className="mt-12 border-t border-outline-variant/30 pt-8 text-xs leading-relaxed text-on-surface-variant">
        This visualizer is educational and does not provide legal or customs advice. Requirements change; rely
        on{" "}
        <a href={RESOURCE_URL} className="font-medium text-primary hover:underline">
          current Government of Canada trade guidance
        </a>{" "}
        and qualified professionals for your shipment.
      </footer>
    </div>
  );
}
