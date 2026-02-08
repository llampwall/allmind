"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Clock, Search } from "lucide-react";
import type { SearchHistoryEntry } from "@/lib/mock-data";
import { timeAgo } from "@/lib/utils";

interface SearchHistoryProps {
  history: SearchHistoryEntry[];
  onRerun: (query: string, context: string | null) => void;
}

export function SearchHistory({ history, onRerun }: SearchHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-sm border border-border bg-card border-glow">
      {/* Toggle Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-secondary/30"
      >
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <Clock className="h-3 w-3 text-muted-foreground" />
          <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
            Search History
          </h2>
          <span className="font-mono text-[10px] text-muted-foreground">
            {history.length} recent
          </span>
        </div>
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {/* History List */}
      {expanded && (
        <div className="border-t border-border">
          {history.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onRerun(entry.query, entry.context)}
              className="flex w-full items-center gap-3 border-b border-border px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-secondary/30"
            >
              <Search className="h-3 w-3 shrink-0 text-muted-foreground/50" />
              <span className="flex-1 truncate font-mono text-[11px] text-foreground">
                {entry.query}
              </span>
              {entry.context ? (
                <span className="rounded-sm bg-secondary px-2 py-0.5 font-mono text-[9px] text-muted-foreground">
                  {entry.context}
                </span>
              ) : (
                <span className="rounded-sm bg-primary/10 px-2 py-0.5 font-mono text-[9px] text-primary">
                  ALL
                </span>
              )}
              <span className="font-mono text-[10px] text-primary">
                {entry.result_count}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/50">
                {timeAgo(entry.timestamp)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
