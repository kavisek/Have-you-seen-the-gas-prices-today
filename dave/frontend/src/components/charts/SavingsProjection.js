"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export function SavingsProjection({ annualVolume, currentRate, optimizedRate }) {
  const monthlySavings = (annualVolume * (currentRate - optimizedRate)) / 100 / 12;
  const data = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    savings: Math.round(monthlySavings * (i + 1)),
    withoutUsmca: Math.round(((annualVolume * currentRate) / 100 / 12) * (i + 1)),
  }));

  return (
    <AreaChart width={480} height={200} data={data}>
      <defs>
        <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="var(--chart-savings)" stopOpacity={0.3} />
          <stop offset="95%" stopColor="var(--chart-savings)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} />
      <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "#9ca3af" }} />
      <Tooltip formatter={(v) => `CAD $${Number(v).toLocaleString("en-CA")}`} />
      <Area
        type="monotone"
        dataKey="savings"
        stroke="var(--chart-savings)"
        fill="url(#savingsGrad)"
        strokeWidth={2}
        animationDuration={1500}
        name="Cumulative Savings"
      />
    </AreaChart>
  );
}
