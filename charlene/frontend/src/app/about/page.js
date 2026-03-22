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
    <div className="min-h-screen w-full bg-background px-4 pb-12 pt-28 retro-grid md:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="font-headline mb-2 border-b-4 border-primary pb-4 text-2xl font-black uppercase text-white">
          How cross-border trade works
        </h1>
        <p className="font-pixel mb-10 text-[10px] uppercase text-on-surface-variant">
          A step-by-step framework for navigating Canadian import and export compliance.
        </p>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={step.number} className="group flex gap-6">
              <div className="flex flex-col items-center">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border-2 border-primary bg-background font-pixel text-[10px] font-bold text-primary">
                  {step.number}
                </div>
                {i < steps.length - 1 && <div className="my-2 w-px flex-1 bg-outline-variant" />}
              </div>

              <div className="pb-10">
                <h2 className="font-headline mb-1 text-base font-bold uppercase text-secondary-fixed">{step.title}</h2>
                <p className="text-sm leading-relaxed text-on-surface-variant">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
