"use client";

import React from "react"

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, ToggleLeft, ToggleRight } from "lucide-react";
import type { ChinvexContext } from "@/lib/mock-data";

interface SearchBarProps {
  contexts: ChinvexContext[];
  selectedContext: string | null;
  onSelectContext: (ctx: string | null) => void;
  onSearch: (query: string, context: string | null) => void;
}

export function SearchBar({
  contexts,
  selectedContext,
  onSelectContext,
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [searchAll, setSearchAll] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    onSearch(query.trim(), searchAll ? null : selectedContext);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const displayContext = searchAll
    ? "ALL CONTEXTS"
    : selectedContext || "Select context...";

  return (
    <div className="rounded-sm border border-border bg-card border-glow">
      <div className="flex items-center gap-3 px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-primary" />

        {/* Query Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search the knowledge base..."
          className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        {/* Context Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={searchAll}
            className="flex items-center gap-2 rounded-sm border border-border bg-secondary px-3 py-1.5 font-mono text-[11px] text-secondary-foreground transition-colors hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="max-w-[140px] truncate">{displayContext}</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {dropdownOpen && !searchAll && (
            <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-sm border border-border bg-popover shadow-lg">
              {contexts.map((ctx) => (
                <button
                  key={ctx.name}
                  type="button"
                  onClick={() => {
                    onSelectContext(ctx.name);
                    setDropdownOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-[11px] transition-colors hover:bg-secondary ${
                    selectedContext === ctx.name
                      ? "bg-primary/10 text-primary"
                      : "text-foreground"
                  }`}
                >
                  <ContextStatusDot status={ctx.status} />
                  <span className="truncate">{ctx.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search All Toggle */}
        <button
          type="button"
          onClick={() => setSearchAll(!searchAll)}
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          {searchAll ? (
            <ToggleRight className="h-4 w-4 text-primary" />
          ) : (
            <ToggleLeft className="h-4 w-4" />
          )}
          All
        </button>

        {/* Search Button */}
        <button
          type="button"
          onClick={handleSearch}
          disabled={!query.trim()}
          className="rounded-sm border border-primary/40 bg-primary/10 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Query
        </button>
      </div>
    </div>
  );
}

function ContextStatusDot({ status }: { status: string }) {
  const color: Record<string, string> = {
    synced: "bg-emerald-500",
    indexing: "bg-amber-500 animate-pulse",
    stale: "bg-muted-foreground",
    error: "bg-red-500",
  };
  return (
    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color[status] || "bg-muted-foreground"}`} />
  );
}
