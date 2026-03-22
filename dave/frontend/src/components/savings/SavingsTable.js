"use client";

import { motion } from "motion/react";

const TASKS = [
  { id: "classify", label: "HTS Classification", attorneyHrs: "2–4 hrs", attorneyCost: "$900–$1,800", tariffiqTime: "~12 sec", tariffiqCost: "$0.003", speedup: "~900x" },
  { id: "usmca", label: "USMCA Origin Analysis", attorneyHrs: "3–6 hrs", attorneyCost: "$1,350–$2,700", tariffiqTime: "~20 sec", tariffiqCost: "$0.006", speedup: "~540x" },
  { id: "engineer", label: "Tariff Engineering", attorneyHrs: "4–8 hrs", attorneyCost: "$1,800–$3,600", tariffiqTime: "~25 sec", tariffiqCost: "$0.008", speedup: "~576x" },
  { id: "coo", label: "Certificate of Origin", attorneyHrs: "1–2 hrs", attorneyCost: "$450–$900", tariffiqTime: "~3 sec", tariffiqCost: "$0.001", speedup: "~1200x" },
  { id: "binding", label: "Binding Ruling Draft", attorneyHrs: "8–15 hrs", attorneyCost: "$3,600–$6,750", tariffiqTime: "~35 sec", tariffiqCost: "$0.012", speedup: "~823x" },
];

export function SavingsTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-left">
            <th className="px-4 py-3 font-medium">Task</th>
            <th className="px-4 py-3 font-medium">Attorney hours</th>
            <th className="px-4 py-3 font-medium">Attorney cost (CAD)</th>
            <th className="px-4 py-3 font-medium">TariffIQ time</th>
            <th className="px-4 py-3 font-medium">TariffIQ cost</th>
            <th className="px-4 py-3 font-medium">Speedup</th>
          </tr>
        </thead>
        <tbody>
          {TASKS.map((row, i) => (
            <motion.tr
              key={row.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/30"
            >
              <td className="px-4 py-3 font-medium">{row.label}</td>
              <td className="px-4 py-3 text-amber-600 dark:text-amber-400">{row.attorneyHrs}</td>
              <td className="px-4 py-3 text-red-600 dark:text-red-400">{row.attorneyCost}</td>
              <td className="px-4 py-3 text-green-600 dark:text-green-400">{row.tariffiqTime}</td>
              <td className="px-4 py-3 text-green-600 dark:text-green-400">{row.tariffiqCost}</td>
              <td className="px-4 py-3">
                <span className="bg-blue-500/20 text-blue-600 dark:text-blue-300 text-xs font-semibold px-2 py-1 rounded-full">
                  {row.speedup}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-zinc-50 dark:bg-zinc-900/40 text-xs text-zinc-500">
            <td colSpan={6} className="px-4 py-2">
              Attorney rates based on Canadian trade law market rates ($400–$500/hr). TariffIQ costs illustrative.
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
