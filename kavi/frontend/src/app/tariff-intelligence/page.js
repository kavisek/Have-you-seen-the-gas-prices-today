"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4002";

function confidenceBadgeClass(confidence) {
  if (confidence === "high") {
    return "border-tertiary bg-tertiary/15 text-tertiary";
  }
  if (confidence === "medium") {
    return "border-secondary-fixed bg-secondary-fixed/10 text-secondary-fixed";
  }
  return "border-outline-variant bg-surface-container-high text-on-surface-variant";
}

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

  const opportunities = data?.opportunities ?? [];

  return (
    <div className="min-h-screen w-full bg-background px-4 pb-12 pt-28 retro-grid md:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 border-b-4 border-primary pb-4">
          <h1 className="font-headline text-2xl font-black uppercase text-white md:text-3xl">Tariff intelligence</h1>
          <p className="font-pixel mt-2 max-w-2xl text-[10px] uppercase leading-relaxed text-on-surface-variant">
            Scans for legitimate alternative HS classifications that may reduce duty exposure.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mb-8 max-w-xl space-y-4 border-2 border-outline-variant bg-surface-container p-6">
          <div className="space-y-2">
            <label className="font-headline text-xs font-bold uppercase text-primary">HTS / HS code</label>
            <input
              className="w-full border-2 border-outline-variant bg-background px-3 py-2 font-mono text-sm uppercase text-on-surface outline-none placeholder:text-outline-variant focus:border-secondary-fixed"
              value={hts}
              onChange={(e) => setHts(e.target.value)}
              placeholder="e.g. 9403.60.00"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="font-headline text-xs font-bold uppercase text-primary">Product description</label>
            <textarea
              className="min-h-[88px] w-full border-2 border-outline-variant bg-background px-3 py-2 font-sans text-sm text-on-surface outline-none placeholder:text-outline-variant focus:border-secondary-fixed"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product in detail"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="font-headline text-xs font-bold uppercase text-primary">Annual export volume (CAD)</label>
            <input
              className="w-full border-2 border-outline-variant bg-background px-3 py-2 font-mono text-sm text-on-surface outline-none placeholder:text-outline-variant focus:border-secondary-fixed"
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
            className="font-headline border-2 border-primary bg-primary px-6 py-2 text-sm font-bold uppercase text-on-primary shadow-[4px_4px_0px_0px_rgba(81,0,81,1)] transition-transform active:translate-y-0.5 active:shadow-none disabled:opacity-50"
          >
            {loading ? "Scanning…" : "Scan opportunities"}
          </button>
        </form>

        {error && (
          <div className="mb-6 max-w-xl border-2 border-error bg-error-container px-4 py-3 font-pixel text-[10px] uppercase text-on-error-container">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {data.estimated_annual_savings != null && (
              <div className="max-w-xl border-2 border-tertiary bg-surface-container-high px-4 py-3">
                <p className="font-headline text-sm font-bold uppercase text-tertiary">
                  Estimated annual savings: CAD{" "}
                  {data.estimated_annual_savings.toLocaleString("en-CA", { maximumFractionDigits: 0 })}
                </p>
              </div>
            )}

            {opportunities.length === 0 ? (
              <p className="font-pixel text-[10px] uppercase text-on-surface-variant">
                No alternative classifications found for this product.
              </p>
            ) : (
              <ul className="max-w-3xl space-y-4">
                {opportunities.map((o, i) => (
                  <li
                    key={i}
                    className="space-y-3 border-2 border-outline-variant bg-surface-container p-4 transition-colors hover:border-primary"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-sm font-bold text-secondary-fixed">{o.alternative_hts}</span>
                      <span
                        className={`border-2 px-2 py-0.5 font-pixel text-[8px] font-bold uppercase ${confidenceBadgeClass(o.confidence)}`}
                      >
                        {o.confidence} confidence
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-on-surface">{o.required_change}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-pixel text-[9px] uppercase text-on-surface-variant">
                      <span>Rate: {o.alternative_rate}</span>
                      <span>
                        Delta: {o.duty_delta_pct > 0 ? "+" : ""}
                        {o.duty_delta_pct}%
                      </span>
                      <span>Complexity: {o.change_complexity}</span>
                      {o.estimated_annual_savings_cad != null && (
                        <span className="font-bold text-tertiary">
                          ~CAD {o.estimated_annual_savings_cad.toLocaleString("en-CA", { maximumFractionDigits: 0 })} / yr
                        </span>
                      )}
                    </div>
                    {o.binding_ruling_recommended && (
                      <p className="border-l-2 border-error pl-2 font-pixel text-[9px] uppercase text-error">
                        Binding ruling recommended before implementation
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {data.disclaimer && (
              <p className="max-w-2xl border-t-2 border-outline-variant pt-4 font-pixel text-[9px] uppercase leading-relaxed text-on-surface-variant">
                {data.disclaimer}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
