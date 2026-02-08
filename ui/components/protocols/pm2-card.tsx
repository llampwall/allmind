"use client";

import {
  Activity,
  Cpu,
  FolderOpen,
  HardDrive,
  FileCode,
  RefreshCw,
  RotateCcw,
  Square,
} from "lucide-react";
import type { ApiService } from "@/lib/types";

interface Pm2CardProps {
  process: ApiService;
}

const statusConfig: Record<
  string,
  { label: string; color: string; dot: string; border: string }
> = {
  online: {
    label: "ONLINE",
    color: "text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-500/20",
  },
  stopped: {
    label: "STOPPED",
    color: "text-amber-400",
    dot: "bg-amber-500",
    border: "border-amber-500/20",
  },
  errored: {
    label: "ERRORED",
    color: "text-red-400",
    dot: "bg-red-500",
    border: "border-red-500/20",
  },
};

function formatUptime(ms: number | null | undefined): string {
  if (!ms || ms === 0) return "--";
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function truncatePath(path: string, maxLen = 40): string {
  if (path.length <= maxLen) return path;
  return `...${path.slice(-(maxLen - 3))}`;
}

function BarMeter({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1 w-full rounded-full bg-secondary">
      <div className={`h-1 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Pm2Card({ process: p }: Pm2CardProps) {
  const cfg = statusConfig[p.status];
  const isStopped = p.status === "stopped";

  return (
    <div
      className={`flex flex-col rounded-sm border bg-card border-glow transition-colors ${
        isStopped ? "border-border opacity-60" : `${cfg.border} bg-card`
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full ${cfg.dot} ${
              p.status === "online" ? "animate-pulse" : ""
            }`}
          />
          <span className="font-mono text-xs font-semibold text-foreground">
            {p.name}
          </span>
        </div>
        <span className={`font-mono text-[10px] font-semibold ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4">
        {/* PID + Uptime row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-0.5 font-mono text-[9px] uppercase text-muted-foreground/70">
              PID
            </p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {(p.pid && p.pid > 0) ? p.pid : "--"}
            </p>
          </div>
          <div>
            <p className="mb-0.5 font-mono text-[9px] uppercase text-muted-foreground/70">
              Uptime
            </p>
            <p className="flex items-center gap-1.5 font-mono text-sm font-semibold text-foreground">
              <Activity className="h-3 w-3 text-muted-foreground" />
              {formatUptime(p.uptime)}
            </p>
          </div>
        </div>

        {/* CPU + Memory bars */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                <Cpu className="h-2.5 w-2.5" /> CPU
              </span>
              <span className="font-mono text-[10px] font-semibold text-foreground">
                {(p.cpu ?? 0).toFixed(1)}%
              </span>
            </div>
            <BarMeter
              value={p.cpu ?? 0}
              max={100}
              color={
                (p.cpu ?? 0) > 70 ? "bg-red-500" : (p.cpu ?? 0) > 40 ? "bg-amber-500" : "bg-emerald-500"
              }
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                <HardDrive className="h-2.5 w-2.5" /> MEM
              </span>
              <span className="font-mono text-[10px] font-semibold text-foreground">
                {formatBytes(p.memory ?? 0)}
              </span>
            </div>
            <BarMeter
              value={p.memory ?? 0}
              max={1024 * 1024 * 1024}
              color={
                (p.memory ?? 0) > 700 * 1024 * 1024
                  ? "bg-red-500"
                  : (p.memory ?? 0) > 400 * 1024 * 1024
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }
            />
          </div>
        </div>

        {/* Restarts */}
        <div className="flex items-center gap-2">
          <RotateCcw className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-[10px] text-muted-foreground">
            Restarts:
          </span>
          <span
            className={`font-mono text-[10px] font-semibold ${
              (p.restarts ?? 0) >= 10
                ? "text-red-400"
                : (p.restarts ?? 0) >= 5
                  ? "text-amber-400"
                  : "text-foreground"
            }`}
          >
            {p.restarts ?? 0}
          </span>
        </div>

        {/* CWD + Script */}
        <div className="flex flex-col gap-1.5 border-t border-border/50 pt-3">
          {p.cwd && (
            <div className="flex items-center gap-2">
              <FolderOpen className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span
                className="truncate font-mono text-[10px] text-muted-foreground"
                title={p.cwd}
              >
                {truncatePath(p.cwd)}
              </span>
            </div>
          )}
          {p.script && (
            <div className="flex items-center gap-2">
              <FileCode className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span
                className="truncate font-mono text-[10px] text-muted-foreground"
                title={p.script}
              >
                {truncatePath(p.script)}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 border-t border-border/50 pt-3">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-sm border border-border bg-transparent px-3 py-1.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3" />
            Restart
          </button>
          <button
            type="button"
            disabled={isStopped}
            className="flex items-center gap-1.5 rounded-sm border border-destructive/20 bg-transparent px-3 py-1.5 font-mono text-[10px] text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Square className="h-3 w-3" />
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
