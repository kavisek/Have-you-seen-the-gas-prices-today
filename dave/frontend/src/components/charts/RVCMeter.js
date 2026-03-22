"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

export function RVCMeter({ rvc, threshold }) {
  const passes = rvc >= threshold;
  const color = passes ? "var(--color-success)" : "var(--color-danger)";
  const data = [{ value: Math.min(100, Math.max(0, rvc)), fill: color }];

  return (
    <div className="relative flex items-center justify-center">
      <RadialBarChart
        width={200}
        height={200}
        cx={100}
        cy={100}
        innerRadius={70}
        outerRadius={90}
        startAngle={180}
        endAngle={0}
        data={data}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar dataKey="value" cornerRadius={8} background />
      </RadialBarChart>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {Math.round(rvc)}%
        </span>
        <span className="text-xs text-zinc-400">
          {passes ? "QUALIFIES" : `Need ${threshold}%`}
        </span>
      </div>
    </div>
  );
}
