"use client";

import { Database, Layers } from "lucide-react";
import type { ChinvexContext } from "@/lib/types";

interface ContextBrowserProps {
  contexts: ChinvexContext[];
  selectedContext: string | null;
  onSelect: (name: string) => void;
}

const statusConfig: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  synced: {
    label: "SYNCED",
    color: "text-emerald-400",
    dot: "bg-emerald-500",
  },
  indexing: {
    label: "INDEXING",
    color: "text-amber-400",
    dot: "bg-amber-500 animate-pulse",
  },
  stale: {
    label: "STALE",
    color: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  error: { label: "ERROR", color: "text-red-400", dot: "bg-red-500" },
};

export function ContextBrowser({
  contexts,
  selectedContext,
  onSelect,
}: ContextBrowserProps) {
  const totalChunks = contexts.reduce((sum, c) => sum + (c.chunk_count ?? 0), 0);
  const totalFiles = contexts.reduce((sum, c) => sum + (c.file_count ?? 0), 0);

  function timeAgo(dateStr: string): string {
    const ms = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <div className="flex flex-col rounded-sm border border-border bg-card border-glow">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
            Context Index
          </h2>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {contexts.length} contexts
        </span>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 border-b border-border px-4 py-2">
        <div className="flex items-center gap-1.5">
          <Database className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-[10px] text-muted-foreground">
            {totalFiles.toLocaleString()} files
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Layers className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-[10px] text-muted-foreground">
            {totalChunks.toLocaleString()} chunks
          </span>
        </div>
      </div>

      {/* Context List */}
      <div className="flex flex-col overflow-auto">
        {contexts.map((ctx) => {
          const status = statusConfig[ctx.status || "synced"] || statusConfig.stale;
          const isSelected = selectedContext === ctx.name;

          return (
            <button
              key={ctx.name}
              type="button"
              onClick={() => onSelect(ctx.name)}
              className={`flex flex-col gap-1.5 border-b border-border px-4 py-3 text-left transition-colors hover:bg-secondary/50 ${
                isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[11px] font-medium ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {ctx.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                  />
                  <span
                    className={`font-mono text-[9px] uppercase tracking-wider ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {ctx.file_count !== undefined && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {ctx.file_count} files
                  </span>
                )}
                {ctx.chunk_count !== undefined && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {ctx.chunk_count.toLocaleString()} chunks
                  </span>
                )}
                <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">
                  {timeAgo(ctx.updated_at)}
                </span>
              </div>

              {ctx.aliases.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {ctx.aliases.map((alias) => (
                    <span
                      key={alias}
                      className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
