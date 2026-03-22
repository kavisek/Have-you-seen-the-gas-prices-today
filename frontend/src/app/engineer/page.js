"use client";

import { useState } from "react";
import { apiPostJson } from "@/lib/api";
import { PageTransition } from "@/components/PageTransition";
import { SavingsProjection } from "@/components/charts/SavingsProjection";
import { useSavingsStore } from "@/store/savings";
import { SavingsToast } from "@/components/savings/SavingsToast";

export default function EngineerPage() {
  const [hts, setHts] = useState("9403.60.00");
  const [description, setDescription] = useState("Wooden office desk");
  const [vol, setVol] = useState("100000");
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, savedCAD: 0, savedHours: 0, speedup: 1 });
  const addTask = useSavingsStore((s) => s.addTask);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await apiPostJson("/engineer", {
        hts_code: hts,
        description,
        annual_volume_cad: parseFloat(vol) || 0,
      });
      setData(res);
      if (res.savings_estimate) {
        addTask({
          task: "engineer",
          savedCAD: res.savings_estimate.attorney_cost_cad - (res.savings_estimate.tariffiq_cost || 0),
          savedHours: 6,
          speedup: 400,
          completedAt: new Date().toISOString(),
        });
        setToast({
          visible: true,
          savedCAD: res.savings_estimate.attorney_cost_cad - (res.savings_estimate.tariffiq_cost || 0),
          savedHours: 6,
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
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Tariff engineering</h1>
        <p className="text-sm text-zinc-500">
          Explores alternative legitimate classifications. Requires ANTHROPIC_API_KEY on the server.
        </p>
        <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
          <input className="w-full border rounded-lg px-3 py-2" value={hts} onChange={(e) => setHts(e.target.value)} />
          <textarea className="w-full border rounded-lg px-3 py-2 min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input
            className="w-full border rounded-lg px-3 py-2"
            type="number"
            placeholder="Annual volume CAD"
            value={vol}
            onChange={(e) => setVol(e.target.value)}
          />
          <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm">
            {loading ? "Scanning…" : "Scan opportunities"}
          </button>
        </form>
        {err && <p className="text-red-500 text-sm">{err}</p>}
        {data && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-500">{data.disclaimer}</p>
            <ul className="space-y-2">
              {(data.opportunities || []).map((o, i) => (
                <li key={i} className="border rounded-lg p-3 text-sm">
                  <span className="font-mono text-blue-500">{o.alternative_hts}</span> — {o.required_change} (
                  {o.confidence} confidence)
                </li>
              ))}
            </ul>
            <SavingsProjection annualVolume={parseFloat(vol) || 0} currentRate={6.5} optimizedRate={0} />
          </div>
        )}
        <SavingsToast
          task="engineer"
          savedCAD={toast.savedCAD}
          savedHours={toast.savedHours}
          speedup={toast.speedup}
          visible={toast.visible}
        />
      </div>
    </PageTransition>
  );
}
