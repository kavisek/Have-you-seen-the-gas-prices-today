"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4002";

export default function TariffIntelligencePage() {
  const [hts, setHts] = useState("9403.60.00");
  const [description, setDescription] = useState("Wooden office desk");
  const [volume, setVolume] = useState("100000");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`${API_URL}/tariff-intelligence/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hts_code: hts,
          description,
          annual_volume_cad: parseFloat(volume) || 0,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed (${res.status})`);
      }
      setData(await res.json());
    } catch (err) {
      setError(err.message || "Failed to scan opportunities");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">Tariff Intelligence</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Scans for legitimate alternative HS classifications that may reduce your duty exposure.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            HTS / HS Code
          </label>
          <input
            className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={hts}
            onChange={(e) => setHts(e.target.value)}
            placeholder="e.g. 9403.60.00"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Product Description
          </label>
          <textarea
            className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the product in detail"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Annual Export Volume (CAD)
          </label>
          <input
            className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="number"
            min="0"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            placeholder="100000"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {loading ? "Scanning…" : "Scan opportunities"}
        </button>
      </form>

      {error && (
        <div className="max-w-xl rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {data.estimated_annual_savings != null && (
            <div className="max-w-xl rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Estimated annual savings: CAD {data.estimated_annual_savings.toLocaleString("en-CA", { maximumFractionDigits: 0 })}
              </p>
            </div>
          )}

          {data.opportunities.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No alternative classifications found for this product.</p>
          ) : (
            <ul className="space-y-2 max-w-xl">
              {data.opportunities.map((o, i) => (
                <li
                  key={i}
                  className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-1 bg-white dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-blue-500 text-sm font-medium">{o.alternative_hts}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      o.confidence === "high"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : o.confidence === "medium"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    }`}>
                      {o.confidence} confidence
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{o.required_change}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
                    <span>Rate: {o.alternative_rate}</span>
                    <span>Delta: {o.duty_delta_pct > 0 ? "+" : ""}{o.duty_delta_pct}%</span>
                    <span>Complexity: {o.change_complexity}</span>
                    {o.estimated_annual_savings_cad != null && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        ~CAD {o.estimated_annual_savings_cad.toLocaleString("en-CA", { maximumFractionDigits: 0 })} saved/yr
                      </span>
                    )}
                  </div>
                  {o.binding_ruling_recommended && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">Binding ruling recommended before implementation</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xl">{data.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
