"use client";

import { useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  HardDrive,
  Shield,
} from "lucide-react";
import { Panel } from "./panel";
import type { Protocol } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

interface DiagnosticsPanelProps {
  protocols: Protocol[];
  vectorStores?: any[]; // Optional, for future use
}

const statusConfig: Record<
  string,
  { color: string; bg: string; label: string; dot: string }
> = {
  online: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "ONLINE",
    dot: "bg-emerald-500",
  },
  degraded: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    label: "DEGRADED",
    dot: "bg-amber-500",
  },
  offline: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    label: "OFFLINE",
    dot: "bg-red-500",
  },
};

const vectorStatusConfig: Record<
  string,
  { color: string; dot: string; label: string }
> = {
  synced: { color: "text-emerald-400", dot: "bg-emerald-500", label: "SYNCED" },
  indexing: { color: "text-amber-400", dot: "bg-amber-500", label: "INDEXING" },
  stale: { color: "text-muted-foreground", dot: "bg-muted-foreground", label: "STALE" },
  error: { color: "text-red-400", dot: "bg-red-500", label: "ERROR" },
};

function BarMeter({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 w-full rounded-full bg-secondary">
      <div
        className={`h-1 rounded-full ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

const VECTOR_STORE_INITIAL_COUNT = 5;

export function DiagnosticsPanel({ protocols, vectorStores = [] }: DiagnosticsPanelProps) {
  const primary = protocols.find((p) => p.isPrimary);
  const subProcesses = protocols.filter((p) => !p.isPrimary);
  const [showAllVectors, setShowAllVectors] = useState(false);

  const displayedStores = showAllVectors
    ? vectorStores
    : vectorStores.slice(0, VECTOR_STORE_INITIAL_COUNT);

  return (
    <Panel title="Diagnostics" subtitle="Protocol Status">
      <div className="flex flex-col gap-5">
        {/* Primary Daemon */}
        {primary && (
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-xs font-semibold text-foreground">
                  {primary.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 animate-pulse rounded-full ${statusConfig[primary.status].dot}`}
                />
                <span
                  className={`font-mono text-[10px] font-semibold ${statusConfig[primary.status].color}`}
                >
                  {statusConfig[primary.status].label}
                </span>
              </div>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="font-mono text-[10px] text-muted-foreground">
                Uptime:
              </span>
              <span className="font-mono text-[10px] text-foreground">
                {primary.uptime}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                    <Cpu className="h-2.5 w-2.5" /> CPU
                  </span>
                  <span className="font-mono text-[10px] text-foreground">
                    {primary.cpu}%
                  </span>
                </div>
                <BarMeter
                  value={primary.cpu}
                  color={
                    primary.cpu > 70
                      ? "bg-red-500"
                      : primary.cpu > 40
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                    <HardDrive className="h-2.5 w-2.5" /> MEM
                  </span>
                  <span className="font-mono text-[10px] text-foreground">
                    {primary.memory}%
                  </span>
                </div>
                <BarMeter
                  value={primary.memory}
                  color={
                    primary.memory > 70
                      ? "bg-red-500"
                      : primary.memory > 40
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Sub-processes */}
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Sub-Processes
          </p>
          {subProcesses.map((proto) => {
            const cfg = statusConfig[proto.status];
            return (
              <div
                key={proto.id}
                className={`flex items-center gap-3 rounded-sm border border-border px-3 py-2.5 ${
                  proto.status === "degraded"
                    ? "border-amber-500/20 bg-amber-500/5"
                    : "bg-secondary/30"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                <span className="min-w-0 flex-1 font-mono text-xs text-foreground">
                  {proto.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    <Cpu className="mr-1 inline h-2.5 w-2.5" />
                    {proto.cpu}%
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    <HardDrive className="mr-1 inline h-2.5 w-2.5" />
                    {proto.memory}%
                  </span>
                  <span
                    className={`font-mono text-[10px] font-semibold ${cfg.color}`}
                  >
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vector Stores - Only show if we have data */}
        {vectorStores.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Database className="h-3 w-3 text-primary" />
              <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                Vector Stores
              </p>
              <span className="font-mono text-[10px] text-muted-foreground">
                ({vectorStores.length})
              </span>
            </div>
            {displayedStores.map((ctx) => {
            const vcfg = vectorStatusConfig[ctx.status || "synced"];
            return (
              <div
                key={ctx.name}
                className={`flex items-center gap-3 rounded-sm border px-3 py-2.5 ${
                  ctx.status === "stale"
                    ? "border-muted-foreground/20 bg-secondary/20"
                    : ctx.status === "indexing"
                      ? "border-amber-500/20 bg-amber-500/5"
                      : ctx.status === "error"
                        ? "border-red-500/20 bg-red-500/5"
                        : "border-border bg-secondary/30"
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${vcfg.dot} ${
                    ctx.status === "indexing" ? "animate-pulse" : ""
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-foreground">
                    {ctx.name}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {(ctx.chunk_count || 0).toLocaleString()} chunks &middot;{" "}
                    {ctx.file_count || 0} files &middot; {timeAgo(ctx.updated_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-mono text-[10px] font-semibold ${vcfg.color}`}
                >
                  {vcfg.label}
                </span>
              </div>
            );
          })}
          {vectorStores.length > VECTOR_STORE_INITIAL_COUNT && (
            <button
              type="button"
              onClick={() => setShowAllVectors(!showAllVectors)}
              className="flex items-center justify-center gap-1.5 rounded-sm border border-border bg-secondary/30 px-3 py-2 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
            >
              {showAllVectors ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show {vectorStores.length - VECTOR_STORE_INITIAL_COUNT} More
                </>
              )}
            </button>
          )}
          </div>
        )}
      </div>
    </Panel>
  );
}
