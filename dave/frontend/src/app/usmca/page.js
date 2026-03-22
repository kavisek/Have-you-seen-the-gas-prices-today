"use client";

import { useMemo, useState } from "react";
import { apiPostJson } from "@/lib/api";
import { PageTransition } from "@/components/PageTransition";
import { RVCMeter } from "@/components/charts/RVCMeter";
import { BOMBreakdown } from "@/components/charts/BOMBreakdown";
import { DutyComparison } from "@/components/charts/DutyComparison";
import { useSavingsStore } from "@/store/savings";
import { SavingsToast } from "@/components/savings/SavingsToast";

export default function UsmcaPage() {
  const [hts, setHts] = useState("9403.60.00");
  const [tv, setTv] = useState("1000");
  const [rows, setRows] = useState([
    { material_name: "Oak", origin_country: "CA", unit_cost: 600 },
    { material_name: "Bolts", origin_country: "CN", unit_cost: 100 },
  ]);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, savedCAD: 0, savedHours: 0, speedup: 1 });
  const addTask = useSavingsStore((s) => s.addTask);

  const { orig, non } = useMemo(() => {
    let o = 0;
    let n = 0;
    for (const r of rows) {
      const c = ["US", "CA", "MX"].includes(r.origin_country?.toUpperCase()) ? "o" : "n";
      if (c === "o") o += Number(r.unit_cost) || 0;
      else n += Number(r.unit_cost) || 0;
    }
    return { orig: o, non: n };
  }, [rows]);

  async function runCheck(e) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const payload = {
        hts_code: hts,
        transaction_value: parseFloat(tv) || 0,
        bom_items: rows.map((r) => ({
          material_name: r.material_name,
          origin_country: r.origin_country,
          unit_cost: parseFloat(r.unit_cost) || 0,
          currency: "CAD",
        })),
      };
      const data = await apiPostJson("/usmca/check", payload);
      setResult(data);
      if (data.savings_estimate) {
        addTask({
          task: "usmca",
          savedCAD: data.savings_estimate.attorney_cost_cad - (data.savings_estimate.tariffiq_cost || 0),
          savedHours: 4.5,
          speedup: 400,
          completedAt: new Date().toISOString(),
        });
        setToast({
          visible: true,
          savedCAD: data.savings_estimate.attorney_cost_cad - (data.savings_estimate.tariffiq_cost || 0),
          savedHours: 4.5,
          speedup: 400,
        });
        setTimeout(() => setToast((t) => ({ ...t, visible: false })), 4000);
      }
    } catch (er) {
      setErr(er.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">USMCA eligibility (RVC)</h1>
        <form onSubmit={runCheck} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block text-sm">
              HTS code
              <input className="mt-1 w-full border rounded-lg px-3 py-2 bg-white dark:bg-zinc-900" value={hts} onChange={(e) => setHts(e.target.value)} />
            </label>
            <label className="block text-sm">
              Transaction value (CAD)
              <input className="mt-1 w-full border rounded-lg px-3 py-2 bg-white dark:bg-zinc-900" value={tv} onChange={(e) => setTv(e.target.value)} />
            </label>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Bill of materials</div>
            {rows.map((r, i) => (
              <div key={i} className="flex flex-wrap gap-2 items-end">
                <input
                  className="flex-1 min-w-[120px] border rounded px-2 py-1 text-sm"
                  placeholder="Material"
                  value={r.material_name}
                  onChange={(e) => {
                    const next = [...rows];
                    next[i] = { ...r, material_name: e.target.value };
                    setRows(next);
                  }}
                />
                <input
                  className="w-20 border rounded px-2 py-1 text-sm"
                  placeholder="CC"
                  value={r.origin_country}
                  onChange={(e) => {
                    const next = [...rows];
                    next[i] = { ...r, origin_country: e.target.value };
                    setRows(next);
                  }}
                />
                <input
                  className="w-28 border rounded px-2 py-1 text-sm"
                  type="number"
                  placeholder="Cost"
                  value={r.unit_cost}
                  onChange={(e) => {
                    const next = [...rows];
                    next[i] = { ...r, unit_cost: e.target.value };
                    setRows(next);
                  }}
                />
                <button
                  type="button"
                  className="text-xs text-red-500"
                  onClick={() => setRows(rows.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-sm text-blue-500"
              onClick={() => setRows([...rows, { material_name: "", origin_country: "CA", unit_cost: 0 }])}
            >
              Add line
            </button>
          </div>
          <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm">
            {loading ? "Checking…" : "Check USMCA"}
          </button>
        </form>
        {err && <p className="text-red-500 text-sm">{err}</p>}
        {result && (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="flex justify-center">
              <RVCMeter rvc={result.rvc_percentage} threshold={result.threshold} />
            </div>
            <div>
              <BOMBreakdown originating={orig} nonOriginating={non} />
              <p className="text-sm text-zinc-500 mt-2">{result.reasoning}</p>
              <div className="mt-4">
                <DutyComparison current={12.5} usmca={0} />
              </div>
            </div>
          </div>
        )}
        <SavingsToast
          task="usmca"
          savedCAD={toast.savedCAD}
          savedHours={toast.savedHours}
          speedup={toast.speedup}
          visible={toast.visible}
        />
      </div>
    </PageTransition>
  );
}
