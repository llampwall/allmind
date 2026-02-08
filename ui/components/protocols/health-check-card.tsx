"use client";

import { Globe, Clock, Layers, Brain } from "lucide-react";
import type { HealthCheck } from "@/lib/mock-data";

interface HealthCheckCardProps {
  check: HealthCheck;
}

function formatSeconds(s: number): string {
  if (s === 0) return "--";
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((s % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function HealthCheckCard({ check }: HealthCheckCardProps) {
  const isOnline = check.status === "online";

  return (
    <div
      className={`flex flex-col rounded-sm border bg-card border-glow transition-colors ${
        isOnline
          ? "border-emerald-500/20"
          : "border-red-500/20 opacity-70"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground">
            {check.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              isOnline ? "animate-pulse bg-emerald-500" : "bg-red-500"
            }`}
          />
          <span
            className={`font-mono text-[10px] font-semibold ${
              isOnline ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4">
        {/* URL */}
        <div>
          <p className="mb-0.5 font-mono text-[9px] uppercase text-muted-foreground/70">
            Endpoint
          </p>
          <code className="font-mono text-[11px] text-primary">
            {check.url}
          </code>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 border-t border-border/50 pt-3">
          <div className="flex items-center gap-2">
            <Layers className="h-3 w-3 text-muted-foreground" />
            <div>
              <p className="font-mono text-[9px] uppercase text-muted-foreground/70">
                Version
              </p>
              <p className="font-mono text-[11px] text-foreground">
                {check.details.version}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-3 w-3 text-muted-foreground" />
            <div>
              <p className="font-mono text-[9px] uppercase text-muted-foreground/70">
                Model
              </p>
              <p className="truncate font-mono text-[11px] text-foreground">
                {check.details.embedding_model}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-3 w-3 text-muted-foreground" />
            <div>
              <p className="font-mono text-[9px] uppercase text-muted-foreground/70">
                Contexts
              </p>
              <p className="font-mono text-[11px] text-foreground">
                {check.details.contexts_available}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <div>
              <p className="font-mono text-[9px] uppercase text-muted-foreground/70">
                Uptime
              </p>
              <p className="font-mono text-[11px] text-foreground">
                {formatSeconds(check.details.uptime_seconds)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
