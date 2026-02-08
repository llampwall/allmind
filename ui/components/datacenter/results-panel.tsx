"use client";

import { FileCode, FileText, Settings, Database } from "lucide-react";
import type { EvidenceChunk } from "@/lib/mock-data";

interface ResultsPanelProps {
  results: EvidenceChunk[];
  query: string | null;
  isSearching: boolean;
}

const chunkIcon: Record<string, typeof FileCode> = {
  code: FileCode,
  text: FileText,
  config: Settings,
};

function scoreColor(score: number): string {
  if (score >= 0.9) return "text-emerald-400";
  if (score >= 0.8) return "text-amber-400";
  if (score >= 0.7) return "text-primary";
  return "text-muted-foreground";
}

function scoreBg(score: number): string {
  if (score >= 0.9) return "border-emerald-500/20 bg-emerald-500/5";
  if (score >= 0.8) return "border-amber-500/20 bg-amber-500/5";
  if (score >= 0.7) return "border-primary/20 bg-primary/5";
  return "border-border bg-secondary";
}

export function ResultsPanel({ results, query, isSearching }: ResultsPanelProps) {
  if (isSearching) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="font-mono text-xs text-muted-foreground">
          Querying knowledge base...
        </p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <Database className="h-10 w-10 text-muted-foreground/30" />
        <div className="text-center">
          <p className="font-mono text-xs text-muted-foreground">
            No active query
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground/60">
            Enter a search query to retrieve evidence chunks from the knowledge base
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {results.length} chunks retrieved
        </p>
        <p className="font-mono text-[10px] text-muted-foreground">
          query: <span className="text-primary">{`"${query}"`}</span>
        </p>
      </div>

      {results.map((chunk) => {
        const Icon = chunkIcon[chunk.chunk_type] || FileText;
        return (
          <div
            key={chunk.id}
            className="rounded-sm border border-border bg-card border-glow overflow-hidden"
          >
            {/* Chunk Header */}
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <div className="flex items-center gap-2">
                <Icon className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono text-[11px] text-foreground">
                  {chunk.source_file}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  :{chunk.line_number}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-sm bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  {chunk.context_name}
                </span>
                <span
                  className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] font-semibold ${scoreBg(chunk.relevance_score)} ${scoreColor(chunk.relevance_score)}`}
                >
                  {(chunk.relevance_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Chunk Content */}
            <div className="p-3">
              <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground/90">
                {chunk.content}
              </pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}
