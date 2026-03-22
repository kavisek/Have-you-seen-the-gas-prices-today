"use client";

import { useEffect, useState } from "react";
import { apiPostJson, apiJson } from "@/lib/api";
import { PageTransition } from "@/components/PageTransition";
import { CostComparisonChart } from "@/components/savings/CostComparisonChart";
import { AnnualProjection } from "@/components/savings/AnnualProjection";

export default function SavingsPage() {
  const [result, setResult] = useState(null);
  const [rates, setRates] = useState(null);

  useEffect(() => {
    apiJson("/savings/rates")
      .then(setRates)
      .catch(() => {});
    apiPostJson("/savings/calculate", {
      tasks_completed: { classify: 2, usmca: 1, engineer: 1, coo: 1, binding: 0 },
      attorney_rate: 450,
      estimate: "mid",
    })
      .then(setResult)
      .catch(() => {});
  }, []);

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <h1 className="text-2xl font-semibold">Savings vs trade attorney</h1>
        {result && (
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div className="border rounded-xl p-4">
              <div className="text-2xl font-bold text-green-500">
                ${Math.round(result.total_savings_cad).toLocaleString("en-CA")}
              </div>
              <div className="text-xs text-zinc-500">Total savings (scenario)</div>
            </div>
            <div className="border rounded-xl p-4">
              <div className="text-2xl font-bold">{result.total_hours_saved?.toFixed(1)}</div>
              <div className="text-xs text-zinc-500">Attorney hours equivalent</div>
            </div>
            <div className="border rounded-xl p-4">
              <div className="text-2xl font-bold">{Math.round(result.roi_percentage)}%</div>
              <div className="text-xs text-zinc-500">ROI vs API cost</div>
            </div>
          </div>
        )}
        {result?.task_breakdown?.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-2">Cost comparison</h2>
            <CostComparisonChart breakdown={result.task_breakdown} />
          </div>
        )}
        {result && (
          <div>
            <h2 className="text-lg font-medium mb-2">Annual projection</h2>
            <AnnualProjection monthlySavings={result.total_savings_cad / 12} />
          </div>
        )}
        {rates && (
          <pre className="text-xs bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg overflow-auto">
            {JSON.stringify(rates, null, 2)}
          </pre>
        )}
      </div>
    </PageTransition>
  );
}
