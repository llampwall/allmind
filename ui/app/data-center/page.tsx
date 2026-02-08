"use client";

// Force dynamic rendering to avoid build-time errors with mock data
export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SearchBar } from "@/components/datacenter/search-bar";
import { ResultsPanel } from "@/components/datacenter/results-panel";
import { ContextBrowser } from "@/components/datacenter/context-browser";
import { SearchHistory } from "@/components/datacenter/search-history";
import { useAllmind } from "@/hooks/use-allmind";
import { fetchChinvexContexts, searchChinvex } from "@/lib/api";
import type { SearchHistoryEntry, EvidenceChunk, ChinvexContext } from "@/lib/types";

export default function DataCenterPage() {
  const { operations, refresh } = useAllmind();
  const [contexts, setContexts] = useState<ChinvexContext[]>([]);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [results, setResults] = useState<EvidenceChunk[]>([]);
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContexts() {
      try {
        const data = await fetchChinvexContexts();
        setContexts(data);
      } catch (error) {
        console.error("Failed to fetch Chinvex contexts:", error);
      } finally {
        setLoading(false);
      }
    }
    loadContexts();
  }, []);

  const handleSearch = useCallback(
    async (query: string, context: string | null) => {
      setIsSearching(true);
      setActiveQuery(query);

      try {
        const chunks = await searchChinvex(query, context, 10);
        setResults(chunks);

        // Add to history
        setHistory((prev) => [
          {
            id: `sh-${Date.now()}`,
            query,
            context,
            result_count: chunks.length,
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 9),
        ]);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [],
  );

  const handleRerun = useCallback(
    (query: string, context: string | null) => {
      if (context) setSelectedContext(context);
      handleSearch(query, context);
    },
    [handleSearch],
  );

  const handleContextSelect = useCallback((name: string) => {
    setSelectedContext(name);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        quickAccessOps={operations}
        onRefresh={refresh}
        onReboot={() => {}}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
              Data Center
            </h1>
            <span className="font-mono text-[10px] text-muted-foreground">
              Knowledge Base Search
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-muted-foreground">
              SYS.CLOCK <SystemClock />
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              ONLINE
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Search Area */}
          <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
            {/* Search Bar */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="font-mono text-xs text-muted-foreground">
                  Loading contexts...
                </p>
              </div>
            ) : (
              <SearchBar
                contexts={contexts}
                selectedContext={selectedContext}
                onSelectContext={setSelectedContext}
                onSearch={handleSearch}
              />
            )}

            {/* Results */}
            <ResultsPanel
              results={results}
              query={activeQuery}
              isSearching={isSearching}
            />

            {/* Search History */}
            <SearchHistory history={history} onRerun={handleRerun} />
          </div>

          {/* Context Browser Sidebar */}
          <div className="hidden w-72 shrink-0 overflow-auto border-l border-border p-4 xl:block">
            <ContextBrowser
              contexts={contexts}
              selectedContext={selectedContext}
              onSelect={handleContextSelect}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function SystemClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    function update() {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return <span className="text-foreground">{time}</span>;
}
