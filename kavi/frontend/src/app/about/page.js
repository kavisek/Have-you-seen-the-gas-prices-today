const steps = [
  {
    number: "01",
    title: "Map your trade move",
    body: "Pin down import vs export, who you're dealing with, how goods move (mode, route), and Incoterms. That frames which rules and agencies matter later.",
  },
  {
    number: "02",
    title: "Classify with the Harmonized System",
    body: "Assign a solid HS / tariff classification from product facts and official Canada guidance—not marketplace guesses—because classification drives duties, reporting, and control lists.",
  },
  {
    number: "03",
    title: "Read the Canadian Customs Tariff",
    body: "With classification set, use the Customs Tariff for rates, units of measure, and program columns (e.g. preferential treatment). Keep a record of the tariff line you rely on.",
  },
  {
    number: "04",
    title: "Export and import controls",
    body: "Check whether your product needs permits, registrations, or notices (controlled goods, strategic items, etc.) and allow time for agency review.",
  },
  {
    number: "05",
    title: "Sanctions and restricted parties",
    body: "Screen parties, banks, and payment paths against sanctions; know what to do if something matches.",
  },
  {
    number: "06",
    title: "Trade agreements and origin",
    body: "If you want preferential duty, confirm which agreement applies, rules of origin, and proof of origin (declarations, certificates, etc.).",
  },
  {
    number: "07",
    title: "Declarations and recordkeeping",
    body: "Pull the filing together: classification, valuation, origin, controls; keep invoices, packing lists, permits, and align broker or self-filing and record retention.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 w-full">
      <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2">
        How cross-border trade works
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-10">
        A step-by-step framework for navigating Canadian import and export compliance.
      </p>

      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={step.number} className="flex gap-6 group">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border-2 border-red-600 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-red-600">{step.number}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-700 my-2" />
              )}
            </div>

            {/* Content */}
            <div className="pb-10">
              <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
                {step.title}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {step.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
