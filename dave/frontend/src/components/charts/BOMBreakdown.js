"use client";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export function BOMBreakdown({ originating, nonOriginating, currency = "CAD" }) {
  const data = [
    { name: "North American (originating)", value: originating },
    { name: "Foreign (non-originating)", value: nonOriginating },
  ];
  const COLORS = ["var(--chart-originating)", "var(--chart-non-originating)"];

  return (
    <PieChart width={300} height={300}>
      <Pie
        data={data}
        cx={150}
        cy={130}
        innerRadius={70}
        outerRadius={110}
        paddingAngle={3}
        dataKey="value"
        animationBegin={0}
        animationDuration={800}
      >
        {data.map((_, i) => (
          <Cell key={i} fill={COLORS[i]} />
        ))}
      </Pie>
      <Tooltip formatter={(v) => `${currency} ${Number(v).toLocaleString("en-CA")}`} />
      <Legend />
    </PieChart>
  );
}
