"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4002";

export default function HSCodesPage() {
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, page_size: 50 });
      if (query) params.set("q", query);
      const res = await fetch(`${API_URL}/hs-codes/?${params}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      setData(json.data);
      setTotal(json.total);
      setPages(json.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    setQuery(inputValue);
  }

  return (
    <div className="min-h-screen w-full bg-background px-4 pb-12 pt-28 retro-grid md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 border-b-4 border-secondary-fixed pb-4">
          <h1 className="font-headline text-2xl font-black uppercase text-white md:text-3xl">
            Canadian HS codes — 2026 tariff schedule
          </h1>
          <p className="font-pixel mt-2 text-[10px] uppercase text-on-surface-variant">
            {total.toLocaleString()} codes total
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search by code or description..."
            className="min-w-[200px] flex-1 border-2 border-outline-variant bg-background px-4 py-2 font-pixel text-xs uppercase text-on-surface outline-none placeholder:text-outline-variant focus:border-secondary-fixed"
          />
          <button
            type="submit"
            className="font-headline border-2 border-primary bg-primary px-5 py-2 text-sm font-bold uppercase text-on-primary shadow-[4px_4px_0px_0px_rgba(81,0,81,1)]"
          >
            Search
          </button>
          {query && (
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                setQuery("");
                setPage(1);
              }}
              className="font-headline border-2 border-outline-variant px-4 py-2 text-sm font-bold uppercase text-on-surface-variant hover:border-tertiary hover:text-tertiary"
            >
              Clear
            </button>
          )}
        </form>

        {error && (
          <div className="mb-4 border-2 border-error bg-error-container px-4 py-3 font-pixel text-[10px] uppercase text-on-error-container">
            {error}
          </div>
        )}

        <div className="overflow-x-auto border-2 border-outline-variant">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-high text-left text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant">
                <th className="whitespace-nowrap px-4 py-3">Tariff code</th>
                <th className="px-4 py-3">Description</th>
                <th className="whitespace-nowrap px-4 py-3">UOM</th>
                <th className="whitespace-nowrap px-4 py-3">MFN</th>
                <th className="whitespace-nowrap px-4 py-3">UST (CUSMA)</th>
                <th className="whitespace-nowrap px-4 py-3">GPT</th>
                <th className="whitespace-nowrap px-4 py-3">General</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center font-pixel text-[10px] uppercase text-on-surface-variant">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center font-pixel text-[10px] uppercase text-on-surface-variant">
                    No results found.
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr
                    key={i}
                    className="bg-surface-container transition-colors hover:bg-surface-container-high"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-secondary-fixed">{row.tariff}</td>
                    <td className="max-w-sm px-4 py-3 text-on-surface">
                      {row.description || <span className="italic text-on-surface-variant">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">{row.uom || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">{row.mfn || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">{row.ust || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">{row.gpt || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">{row.general_tariff || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p className="font-pixel text-[10px] uppercase text-on-surface-variant">
              Page {page} of {pages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="font-headline border-2 border-outline-variant px-3 py-1.5 text-sm uppercase text-on-surface transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="font-headline border-2 border-outline-variant px-3 py-1.5 text-sm uppercase text-on-surface transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
