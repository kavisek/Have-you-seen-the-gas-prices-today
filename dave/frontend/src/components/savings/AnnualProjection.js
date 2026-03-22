"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export function AnnualProjection({ monthlySavings }) {
  const [productsPerMonth, setProductsPerMonth] = useState(5);
  const scaledMonthly = (monthlySavings / Math.max(1, 1)) * productsPerMonth;
  const data = Array.from({ length: 13 }, (_, i) => ({
    month:
      i === 0
        ? "Now"
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i - 1],
    cumulative: Math.round(scaledMonthly * i),
    retainer: 3500 * i,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm text-zinc-500">Products exported/month:</label>
        <input
          type="range"
          min={1}
          max={50}
          value={productsPerMonth}
          onChange={(e) => setProductsPerMonth(Number(e.target.value))}
          className="w-40 accent-blue-500"
        />
        <span className="text-sm font-semibold text-zinc-200 w-6">{productsPerMonth}</span>
      </div>
      <AreaChart width={520} height={220} data={data}>
        <defs>
          <linearGradient id="tariffiqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-savings)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--chart-savings)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="retainerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-current)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--chart-current)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "#9ca3af" }} />
        <Tooltip formatter={(v) => `CAD $${Number(v).toLocaleString("en-CA")}`} />
        <Area
          type="monotone"
          dataKey="cumulative"
          name="TariffIQ savings"
          stroke="var(--chart-savings)"
          fill="url(#tariffiqGrad)"
          strokeWidth={2}
          animationDuration={1200}
        />
        <Area
          type="monotone"
          dataKey="retainer"
          name="Attorney retainer cost"
          stroke="var(--chart-current)"
          fill="url(#retainerGrad)"
          strokeWidth={2}
          strokeDasharray="6 3"
          animationDuration={1400}
        />
      </AreaChart>
      <p className="text-xs text-zinc-500">
        Retainer line assumes $3,500/month average trade attorney retainer for comparison.
      </p>
    </div>
  );
}
