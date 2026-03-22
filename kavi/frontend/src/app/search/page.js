"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const LOADING_MESSAGES = [
  "Talking to Mark Carney…",
  "Consulting the lawyers…",
  "Checking in with the accountant…",
  "Sorry, my mom gave me a call — getting back to work…",
  "Cross-referencing the 2026 tariff schedule…",
  "Negotiating with the border agents…",
  "Reading the fine print on the trade agreement…",
  "Asking the HS code oracle…",
  "Bribing the customs officer (legally)…",
  "Double-checking with the WTO…",
  "Calling Ottawa for clarification…",
  "Reviewing the permit requirements…",
  "Almost there, just one more form to fill out…",
];

function LoadingStatus() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % LOADING_MESSAGES.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      {/* Spinner */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-700" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
      </div>

      {/* Cycling message */}
      <p
        className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-xs transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {LOADING_MESSAGES[index]}
      </p>
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4002";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4002";


function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function ResponseBlock({ text }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        const headerMatch = line.match(/^\*\*(.+?)\*\*[:\s]*(.*)/);
        if (headerMatch) {
          return (
            <div key={i}>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {headerMatch[1]}
              </span>
              {headerMatch[2] && <span>: {renderInline(headerMatch[2])}</span>}
            </div>
          );
        }

        // Markdown headings like ## Title or # Title
        const mdHeading = line.match(/^#{1,3}\s+(.*)/);
        if (mdHeading) {
          return (
            <p key={i} className="font-semibold text-zinc-900 dark:text-zinc-100 pt-1">
              {renderInline(mdHeading[1])}
            </p>
          );
        }

        if (/^\d+\.\s/.test(line)) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-zinc-400 shrink-0">{line.match(/^\d+/)[0]}.</span>
              <span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
            </div>
          );
        }

        if (/^[-•*]\s/.test(line)) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-zinc-400 shrink-0 mt-0.5">•</span>
              <span>{renderInline(line.replace(/^[-•*]\s/, ""))}</span>
            </div>
          );
        }

        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(q);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [citations, setCitations] = useState([]);
  const [tokenInfo, setTokenInfo] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!q.trim()) return;
    setInputValue(q);
    fetchAnswer(q);
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function fetchAnswer(product) {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    setCitations([]);
    setTokenInfo(null);

    const ws = new WebSocket(`${WS_URL}/claude/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        message: `What do I need to know to export "${product}" from Canada to the United States? Cover HS codes, tariffs, permits, regulations, and required documents.`,
      }));
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (data.type === "status") return;

      if (data.type === "error") {
        setError(data.detail || "An error occurred");
        setLoading(false);
        ws.close();
        wsRef.current = null;
        return;
      }

      if (data.type === "result") {
        setResponse(data.response);
        setCitations(data.citations || []);
        setTokenInfo({ input: data.input_tokens, output: data.output_tokens });
        setLoading(false);
        ws.close();
        wsRef.current = null;
      }
    };

    ws.onerror = () => {
      setError("WebSocket connection failed. Please try again.");
      setLoading(false);
      wsRef.current = null;
    };

    ws.onclose = () => {
      wsRef.current = null;
    };
  }

  function handleSearch(e) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Sticky search header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="flex items-center flex-1 border border-zinc-300 dark:border-zinc-700 rounded-full px-4 py-2 bg-white dark:bg-zinc-900 gap-2 hover:shadow-sm transition-shadow">
              <svg
                className="w-4 h-4 text-zinc-400 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search a product..."
                className="flex-1 bg-transparent outline-none text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-full transition-colors shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {q && (
          <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 mb-6">
            Export guide:{" "}
            <span className="text-zinc-500 dark:text-zinc-400 font-normal">{q}</span>
          </h1>
        )}

        {loading && <LoadingStatus />}

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {response && (
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <ResponseBlock text={response} />
            </div>

            {citations.length > 0 && (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                  References &amp; Sources
                </h2>
                <ol className="space-y-2">
                  {citations.map((c, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-zinc-400 shrink-0 tabular-nums">{i + 1}.</span>
                      <span>
                        {c.url ? (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            {c.title}
                          </a>
                        ) : (
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">{c.title}</span>
                        )}
                        <span className="text-zinc-400 dark:text-zinc-500"> — {c.organization}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {tokenInfo && (
              <p className="text-xs text-zinc-400 text-right">
                {tokenInfo.input} input · {tokenInfo.output} output tokens ·
                claude-sonnet-4-5
              </p>
            )}

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-xs text-zinc-400 mb-3">Search for another product</p>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. canola oil, live cattle, maple syrup…"
                  className="flex-1 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-zinc-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-lg transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {!loading && !error && !response && !q && (
          <p className="text-zinc-400 text-sm">Enter a product above to get started.</p>
        )}
      </div>
    </div>
  );
}

// Suspense boundary is required — useSearchParams suspends the component tree
// until the client has hydrated. Without it the effect never fires.
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
