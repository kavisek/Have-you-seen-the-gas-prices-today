"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

export function DutyComparison({ current, usmca, engineered }) {
  const data = [
    { label: "Current (MFN)", rate: current },
    { label: "With USMCA", rate: usmca },
    ...(engineered !== undefined ? [{ label: "After Engineering", rate: engineered }] : []),
  ];

  return (
    <BarChart width={320} height={200} data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} />
      <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: "#9ca3af" }} />
      <Tooltip formatter={(v) => `${v}%`} />
      <Bar dataKey="rate" radius={[4, 4, 0, 0]} animationDuration={1000}>
        {data.map((entry, i) => (
          <Cell
            key={i}
            fill={
              entry.rate === 0
                ? "var(--chart-originating)"
                : entry.rate < current
                  ? "var(--chart-savings)"
                  : "var(--chart-current)"
            }
          />
        ))}
      </Bar>
    </BarChart>
  );
}
