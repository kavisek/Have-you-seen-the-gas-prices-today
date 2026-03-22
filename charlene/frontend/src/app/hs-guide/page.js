export default function HSGuidePage() {
  return (
    <div className="min-h-screen w-full bg-background px-4 pb-12 pt-28 retro-grid md:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="font-headline mb-8 border-b-4 border-secondary-fixed pb-4 text-2xl font-black uppercase text-white">
          How to use this HS Code table
        </h1>

        <div className="space-y-8 text-sm text-on-surface">
          <div>
            <h2 className="font-headline mb-2 text-base font-bold uppercase text-primary">What is an HS Code?</h2>
            <p>
              The <strong>Harmonized System (HS)</strong> is a universal 6-digit product classification
              standard maintained by the World Customs Organization (WCO) and used by 200+ countries.
              Canada extends it to 10 digits for national purposes. Every internationally traded good has
              an HS code that determines applicable tariffs, permits, and import/export requirements.
            </p>
          </div>

          <div>
            <h2 className="font-headline mb-2 text-base font-bold uppercase text-primary">Code Structure</h2>
            <div className="space-y-1.5 border-2 border-outline-variant bg-surface-container px-4 py-3 font-mono text-xs">
              <div>
                <span className="text-secondary-fixed">01</span>
                <span className="text-on-surface-variant">02.21.00.10</span> —{" "}
                <span className="text-secondary-fixed">Chapter</span> (2 digits): broad category (e.g. 01 = Live Animals)
              </div>
              <div>
                <span className="text-on-surface-variant">01</span>
                <span className="text-tertiary">02</span>
                <span className="text-on-surface-variant">.21.00.10</span> —{" "}
                <span className="text-tertiary">Heading</span> (4 digits): product family (e.g. 0102 = Live bovine animals)
              </div>
              <div>
                <span className="text-on-surface-variant">0102.</span>
                <span className="text-primary">21</span>
                <span className="text-on-surface-variant">.00.10</span> —{" "}
                <span className="text-primary">Subheading</span> (6 digits): international standard level
              </div>
              <div>
                <span className="text-on-surface-variant">0102.21.</span>
                <span className="text-error">00.10</span> —{" "}
                <span className="text-error">National tariff item</span> (8–10 digits): Canada-specific detail
              </div>
            </div>
            <p className="font-pixel mt-2 text-[10px] uppercase text-on-surface-variant">
              Tariff rates are set at the 8-digit level. The 10-digit level is used for statistical tracking only.
            </p>
          </div>

          <div>
            <h2 className="font-headline mb-3 text-base font-bold uppercase text-primary">Column Definitions</h2>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="font-headline text-on-surface">MFN — Most-Favoured-Nation</dt>
                <dd className="mt-0.5 text-xs text-on-surface-variant">
                  Canada&apos;s standard import rate applied to all WTO members without a specific trade agreement.
                </dd>
              </div>
              <div>
                <dt className="font-headline text-on-surface">UST — CUSMA / USMCA</dt>
                <dd className="mt-0.5 text-xs text-on-surface-variant">
                  Preferential rate under the Canada-United States-Mexico Agreement (CUSMA/USMCA), effective July 1,
                  2020. Usually Free for qualifying goods.
                </dd>
              </div>
              <div>
                <dt className="font-headline text-on-surface">GPT — General Preferential Tariff</dt>
                <dd className="mt-0.5 text-xs text-on-surface-variant">
                  Reduced rate extended to developing countries under Canada&apos;s unilateral preference program.
                </dd>
              </div>
              <div>
                <dt className="font-headline text-on-surface">General Tariff</dt>
                <dd className="mt-0.5 text-xs text-on-surface-variant">
                  Highest rate applied to goods from countries not covered by any Canada trade agreement (non-WTO or
                  non-MFN countries). Typically 35%.
                </dd>
              </div>
              <div>
                <dt className="font-headline text-on-surface">UOM — Unit of Measure</dt>
                <dd className="mt-0.5 text-xs text-on-surface-variant">
                  The unit used when a tariff is specific (e.g. KG = per kilogram, NMB = per number, LT = per litre, M2 =
                  per square metre).
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="font-headline mb-2 text-base font-bold uppercase text-primary">How to Search</h2>
            <ul className="list-inside list-disc space-y-1.5 font-pixel text-[10px] uppercase text-on-surface-variant">
              <li>
                Enter a numeric HS code (e.g. <code className="border border-outline-variant bg-surface-container px-1 font-mono text-secondary-fixed">8703</code>) to find all tariff items under that heading.
              </li>
              <li>
                Enter a keyword (e.g. <code className="border border-outline-variant bg-surface-container px-1 font-mono text-secondary-fixed">canola</code>) to search product descriptions.
              </li>
              <li>
                Combine both (e.g. <code className="border border-outline-variant bg-surface-container px-1 font-mono text-secondary-fixed">1205 rapeseed</code>) to narrow results.
              </li>
              <li>Results are paginated — use Previous / Next to navigate.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
