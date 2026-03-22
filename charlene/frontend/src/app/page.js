"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-zinc-950 px-4">
      <div className="flex flex-col items-center w-full max-w-2xl gap-8">

        <h1 className="text-5xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Export<span className="text-blue-500">Min</span><span className="text-red-500">Max</span><span className="text-yellow-400">er</span>
        </h1>

        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Find permits, HS codes, and requirements to export any product to the US
        </p>

        <form onSubmit={handleSearch} className="w-full">
          <div className="flex items-center w-full border border-zinc-300 dark:border-zinc-700 rounded-full px-5 py-3 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-zinc-900 gap-3">
            <svg
              className="w-4 h-4 text-zinc-400 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a product to export (e.g. softwood lumber)"
              className="flex-1 bg-transparent outline-none text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
              autoFocus
            />
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-md transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                const examples = ["softwood lumber", "canola oil", "live cattle", "aluminum ingots"];
                setQuery(examples[Math.floor(Math.random() * examples.length)]);
              }}
              className="px-5 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-md transition-colors"
            >
              I&apos;m Feeling Lucky
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
