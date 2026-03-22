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
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8">
        <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">Data</span>
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
          Canadian HS codes
        </h1>
        <p className="text-sm text-on-surface-variant">{total.toLocaleString()} codes in schedule</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex flex-wrap gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search by code or description..."
          className="min-w-[200px] flex-1 rounded-2xl border border-outline-variant/40 bg-surface-container-highest px-4 py-3 text-sm text-on-surface outline-none transition-shadow placeholder:text-outline focus:border-primary/50 focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          className="rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-on-primary-fixed transition-colors hover:bg-primary-dim"
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
            className="rounded-2xl border border-outline-variant/40 px-5 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:border-primary/40 hover:text-primary"
          >
            Clear
          </button>
        )}
      </form>

      {error && (
        <div className="mb-4 rounded-2xl border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-low shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/30 bg-surface-container-highest text-left text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              <th className="whitespace-nowrap px-4 py-3">Tariff code</th>
              <th className="px-4 py-3">Description</th>
              <th className="whitespace-nowrap px-4 py-3">UOM</th>
              <th className="whitespace-nowrap px-4 py-3">MFN</th>
              <th className="whitespace-nowrap px-4 py-3">UST (CUSMA)</th>
              <th className="whitespace-nowrap px-4 py-3">GPT</th>
              <th className="whitespace-nowrap px-4 py-3">General</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-on-surface-variant">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-on-surface-variant">
                  No results found.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className="bg-surface-container-low/50 transition-colors hover:bg-surface-container"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-on-surface-variant">
                    {row.tariff}
                  </td>
                  <td className="max-w-sm px-4 py-3 text-on-surface">
                    {row.description || <span className="italic text-outline">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">{row.uom || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">{row.mfn || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">{row.ust || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">{row.gpt || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">
                    {row.general_tariff || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-outline-variant/40 px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-highest disabled:pointer-events-none disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="rounded-xl border border-outline-variant/40 px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-highest disabled:pointer-events-none disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
