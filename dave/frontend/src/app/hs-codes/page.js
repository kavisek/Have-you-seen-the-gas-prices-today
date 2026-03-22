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
    <div className="max-w-6xl mx-auto px-6 py-8 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
          Canadian HS Codes — 2026 Tariff Schedule
        </h1>
        <p className="text-sm text-zinc-500">{total.toLocaleString()} codes total</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search by code or description..."
          className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-5 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Search
        </button>
        {query && (
          <button
            type="button"
            onClick={() => { setInputValue(""); setQuery(""); setPage(1); }}
            className="px-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
              <th className="px-4 py-3 whitespace-nowrap">Tariff Code</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 whitespace-nowrap">UOM</th>
              <th className="px-4 py-3 whitespace-nowrap">MFN</th>
              <th className="px-4 py-3 whitespace-nowrap">UST (CUSMA)</th>
              <th className="px-4 py-3 whitespace-nowrap">GPT</th>
              <th className="px-4 py-3 whitespace-nowrap">General</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                  No results found.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className="bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    {row.tariff}
                  </td>
                  <td className="px-4 py-3 text-zinc-800 dark:text-zinc-200 max-w-sm">
                    {row.description || <span className="text-zinc-400 italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{row.uom || "—"}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{row.mfn || "—"}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{row.ust || "—"}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{row.gpt || "—"}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{row.general_tariff || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-zinc-500">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
