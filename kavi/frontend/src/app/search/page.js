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
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 border-4 border-outline-variant" />
        <div className="absolute inset-0 animate-spin border-4 border-transparent border-t-secondary-fixed" />
      </div>
      <p
        className="font-pixel max-w-xs text-center text-[10px] uppercase text-on-surface-variant transition-opacity duration-400"
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
        <strong key={i} className="font-semibold text-primary">
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
    <div className="space-y-3 text-sm leading-relaxed text-on-surface">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        const headerMatch = line.match(/^\*\*(.+?)\*\*[:\s]*(.*)/);
        if (headerMatch) {
          return (
            <div key={i}>
              <span className="font-headline font-semibold text-white">{headerMatch[1]}</span>
              {headerMatch[2] && <span>: {renderInline(headerMatch[2])}</span>}
            </div>
          );
        }

        // Markdown headings like ## Title or # Title
        const mdHeading = line.match(/^#{1,3}\s+(.*)/);
        if (mdHeading) {
          return (
            <p key={i} className="font-headline pt-1 font-semibold text-white">
              {renderInline(mdHeading[1])}
            </p>
          );
        }

        if (/^\d+\.\s/.test(line)) {
          return (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 text-outline">{line.match(/^\d+/)[0]}.</span>
              <span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span>
            </div>
          );
        }

        if (/^[-•*]\s/.test(line)) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="mt-0.5 shrink-0 text-outline">•</span>
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
      if (wsRef.current !== ws) return;
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
        const apply = () => {
          // Guard against results from a stale ws when a newer search is already in flight
          if (wsRef.current !== null && wsRef.current !== ws) return;
          setResponse(data.response);
          setCitations(data.citations || []);
          setTokenInfo({ input: data.input_tokens, output: data.output_tokens });
          setLoading(false);
        };
        ws.close();
        wsRef.current = null;
        if (data.cached) {
          setTimeout(apply, 7000);
        } else {
          apply();
        }
      }
    };

    ws.onerror = () => {
      if (wsRef.current !== ws) return;
      setError("WebSocket connection failed. Please try again.");
      setLoading(false);
      wsRef.current = null;
    };

    ws.onclose = () => {
      if (wsRef.current === ws) wsRef.current = null;
    };
  }

  function handleSearch(e) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (trimmed === q) {
      fetchAnswer(trimmed);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20 retro-grid">
      <div className="sticky top-20 z-20 flex w-full border-b-4 border-primary bg-background shadow-[4px_4px_0px_0px_rgba(255,171,243,0.35)]">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 md:px-6">
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
            <div className="group flex min-w-0 flex-1 items-center gap-2 border-2 border-outline-variant bg-background px-4 py-2 transition-colors focus-within:border-secondary-fixed">
              <span className="font-pixel shrink-0 text-secondary-fixed">&gt;</span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search product or HS keyword..."
                className="min-w-0 flex-1 border-none bg-transparent font-pixel text-sm uppercase text-secondary-fixed outline-none ring-0 placeholder:text-outline-variant focus:ring-0"
              />
              <span className="ml-1 h-6 w-0.5 shrink-0 animate-pulse bg-secondary-fixed" />
            </div>
            <button
              type="submit"
              className="font-headline shrink-0 border-2 border-primary bg-primary px-4 py-2 text-sm font-bold uppercase text-on-primary shadow-[4px_4px_0px_0px_rgba(81,0,81,1)] transition-transform active:translate-y-0.5 active:shadow-none"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        {q && (
          <h1 className="font-headline mb-6 border-b-2 border-outline-variant pb-4 text-xl font-black uppercase text-white">
            Export guide: <span className="font-normal text-on-surface-variant">{q}</span>
          </h1>
        )}

        {loading && <LoadingStatus />}

        {error && (
          <div className="border-2 border-error bg-error-container px-4 py-3 font-pixel text-[10px] uppercase text-on-error-container">
            {error}
          </div>
        )}

        {response && (
          <div className="space-y-4">
            <div className="border-2 border-outline-variant bg-surface-container p-6">
              <ResponseBlock text={response} />
            </div>

            {citations.length > 0 && (
              <div className="border-2 border-outline-variant bg-surface-container p-5">
                <h2 className="font-headline mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  References &amp; sources
                </h2>
                <ol className="space-y-2">
                  {citations.map((c, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="shrink-0 tabular-nums text-outline">{i + 1}.</span>
                      <span>
                        {c.url ? (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-secondary-fixed underline hover:bg-secondary-fixed hover:text-background"
                          >
                            {c.title}
                          </a>
                        ) : (
                          <span className="font-medium text-on-surface">{c.title}</span>
                        )}
                        <span className="text-on-surface-variant"> — {c.organization}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {tokenInfo && (
              <p className="font-pixel text-right text-[9px] uppercase text-on-surface-variant">
                {tokenInfo.input} input · {tokenInfo.output} output tokens · claude-sonnet-4-5
              </p>
            )}

            <div className="border-t-2 border-outline-variant pt-4">
              <p className="font-pixel mb-3 text-[10px] uppercase text-on-surface-variant">Search for another product</p>
              <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. canola oil, live cattle, maple syrup…"
                  className="min-w-0 flex-1 border-2 border-outline-variant bg-background px-3 py-2 font-pixel text-xs uppercase text-on-surface outline-none placeholder:text-outline-variant focus:border-secondary-fixed"
                />
                <button
                  type="submit"
                  className="font-headline border-2 border-primary bg-primary px-4 py-2 text-sm font-bold uppercase text-on-primary shadow-[4px_4px_0px_0px_rgba(81,0,81,1)]"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {!loading && !error && !response && !q && (
          <p className="font-pixel text-sm uppercase text-on-surface-variant">Enter a product above to get started.</p>
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
        <div className="flex min-h-screen items-center justify-center bg-background retro-grid">
          <div className="flex gap-2">
            <span className="h-2 w-2 animate-bounce bg-tertiary" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 animate-bounce bg-primary" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 animate-bounce bg-secondary-fixed" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
