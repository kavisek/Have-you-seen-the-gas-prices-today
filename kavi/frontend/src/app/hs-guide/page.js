export default function HSGuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 w-full">
      <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-8">
        How to use this HS Code table
      </h1>

      <div className="space-y-8 text-sm text-zinc-700 dark:text-zinc-300">
        <div>
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-100 text-base mb-2">What is an HS Code?</h2>
          <p>
            The <strong>Harmonized System (HS)</strong> is a universal 6-digit product classification
            standard maintained by the World Customs Organization (WCO) and used by 200+ countries.
            Canada extends it to 10 digits for national purposes. Every internationally traded good has
            an HS code that determines applicable tariffs, permits, and import/export requirements.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-100 text-base mb-2">Code Structure</h2>
          <div className="font-mono bg-white dark:bg-zinc-900 rounded px-4 py-3 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1.5">
            <div><span className="text-blue-600 dark:text-blue-400">01</span><span className="text-zinc-400">02.21.00.10</span> — <span className="text-blue-600 dark:text-blue-400">Chapter</span> (2 digits): broad category (e.g. 01 = Live Animals)</div>
            <div><span className="text-zinc-400">01</span><span className="text-green-600 dark:text-green-400">02</span><span className="text-zinc-400">.21.00.10</span> — <span className="text-green-600 dark:text-green-400">Heading</span> (4 digits): product family (e.g. 0102 = Live bovine animals)</div>
            <div><span className="text-zinc-400">0102.</span><span className="text-orange-600 dark:text-orange-400">21</span><span className="text-zinc-400">.00.10</span> — <span className="text-orange-600 dark:text-orange-400">Subheading</span> (6 digits): international standard level</div>
            <div><span className="text-zinc-400">0102.21.</span><span className="text-purple-600 dark:text-purple-400">00.10</span> — <span className="text-purple-600 dark:text-purple-400">National tariff item</span> (8–10 digits): Canada-specific detail</div>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Tariff rates are set at the 8-digit level. The 10-digit level is used for statistical tracking only.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-100 text-base mb-3">Column Definitions</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt className="font-medium text-zinc-800 dark:text-zinc-100">MFN — Most-Favoured-Nation</dt>
              <dd className="text-zinc-500 text-xs mt-0.5">Canada's standard import rate applied to all WTO members without a specific trade agreement.</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-800 dark:text-zinc-100">UST — CUSMA / USMCA</dt>
              <dd className="text-zinc-500 text-xs mt-0.5">Preferential rate under the Canada-United States-Mexico Agreement (CUSMA/USMCA), effective July 1, 2020. Usually Free for qualifying goods.</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-800 dark:text-zinc-100">GPT — General Preferential Tariff</dt>
              <dd className="text-zinc-500 text-xs mt-0.5">Reduced rate extended to developing countries under Canada's unilateral preference program.</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-800 dark:text-zinc-100">General Tariff</dt>
              <dd className="text-zinc-500 text-xs mt-0.5">Highest rate applied to goods from countries not covered by any Canada trade agreement (non-WTO or non-MFN countries). Typically 35%.</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-800 dark:text-zinc-100">UOM — Unit of Measure</dt>
              <dd className="text-zinc-500 text-xs mt-0.5">The unit used when a tariff is specific (e.g. KG = per kilogram, NMB = per number, LT = per litre, M2 = per square metre).</dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-800 dark:text-zinc-100 text-base mb-2">How to Search</h2>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <li>Enter a numeric HS code (e.g. <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded">8703</code>) to find all tariff items under that heading.</li>
            <li>Enter a keyword (e.g. <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded">canola</code>) to search product descriptions.</li>
            <li>Combine both (e.g. <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded">1205 rapeseed</code>) to narrow results.</li>
            <li>Results are paginated — use Previous / Next to navigate.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
