"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const TASK_SHORT = {
  classify: "HTS",
  usmca: "USMCA",
  engineer: "Engineering",
  coo: "Certificate",
  binding: "Binding Ruling",
};

export function CostComparisonChart({ breakdown }) {
  const data = (breakdown || []).map((b) => ({
    name: TASK_SHORT[b.task] ?? b.task,
    "Attorney (CAD)": Math.round(b.attorney_cost),
    "TariffIQ (CAD)": parseFloat(Number(b.tariffiq_cost).toFixed(3)),
  }));

  return (
    <BarChart width={520} height={280} data={data} barGap={4}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
      <YAxis tickFormatter={(v) => `$${v}`} tick={{ fill: "#9ca3af" }} />
      <Tooltip
        formatter={(v, name) =>
          name === "TariffIQ (CAD)" ? `$${Number(v).toFixed(3)}` : `$${Number(v).toLocaleString()}`
        }
      />
      <Legend />
      <Bar dataKey="Attorney (CAD)" fill="var(--chart-current)" radius={[4, 4, 0, 0]} animationDuration={1000} />
      <Bar dataKey="TariffIQ (CAD)" fill="var(--chart-savings)" radius={[4, 4, 0, 0]} animationDuration={1200} />
    </BarChart>
  );
}
