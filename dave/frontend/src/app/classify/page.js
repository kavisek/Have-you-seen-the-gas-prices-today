"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { apiPostJson } from "@/lib/api";
import { PageTransition } from "@/components/PageTransition";
import { useSavingsStore } from "@/store/savings";
import { SavingsToast } from "@/components/savings/SavingsToast";

export default function ClassifyPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [toast, setToast] = useState({ visible: false, savedCAD: 0, savedHours: 0, speedup: 1 });
  const addTask = useSavingsStore((s) => s.addTask);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const data = await apiPostJson("/classify", { name, description });
      setResult(data);
      if (data.savings_estimate) {
        addTask({
          task: "classify",
          savedCAD: data.savings_estimate.attorney_cost_cad - (data.savings_estimate.tariffiq_cost || 0),
          savedHours: 3,
          speedup: 500,
          completedAt: new Date().toISOString(),
        });
        setToast({
          visible: true,
          savedCAD: data.savings_estimate.attorney_cost_cad - (data.savings_estimate.tariffiq_cost || 0),
          savedHours: 3,
          speedup: 500,
        });
        setTimeout(() => setToast((t) => ({ ...t, visible: false })), 4000);
      }
    } catch (er) {
      setErr(er.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">HTS classification</h1>
        <p className="text-sm text-zinc-500">
          Describe your product. The API searches Canadian HS data and returns ranked US HTS-style candidates.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-900"
            placeholder="Product name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            required
            className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 bg-white dark:bg-zinc-900 min-h-[120px]"
            placeholder="Description (required)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-50"
          >
            {loading ? "Running…" : "Classify"}
          </button>
        </form>
        {err && <p className="text-red-500 text-sm">{err}</p>}
        {result?.candidates && (
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12 } },
            }}
          >
            {result.candidates.map((c, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/40"
              >
                <div className="font-mono text-sm text-blue-500">{c.hts_code}</div>
                <div className="text-sm mt-1">{c.description}</div>
                <div className="text-xs text-zinc-500 mt-2">
                  Confidence {(c.confidence * 100).toFixed(0)}% · MFN {c.mfn_rate} · USMCA {c.usmca_rate}
                </div>
                <p className="text-xs text-zinc-400 mt-2">{c.reasoning}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
        <SavingsToast
          task="classify"
          savedCAD={toast.savedCAD}
          savedHours={toast.savedHours}
          speedup={toast.speedup}
          visible={toast.visible}
        />
      </div>
    </PageTransition>
  );
}
