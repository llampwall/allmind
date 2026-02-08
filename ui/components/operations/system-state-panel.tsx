"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Download,
  GitBranch,
  GitCommit,
  HardDrive,
  Layers,
  Loader2,
  Play,
  RefreshCw,
  Search,
  Upload,
  XCircle,
} from "lucide-react";
import { Panel } from "@/components/dashboard/panel";
import { timeAgo } from "@/lib/utils";
import type { ApiRepo, ApiService } from "@/lib/types";

interface SystemStatePanelProps {
  repo: ApiRepo;
  services: ApiService[];
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

const embedStatusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  idle: {
    label: "IDLE",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: <CheckCircle2 className="h-3 w-3 text-emerald-400" />,
  },
  embedding: {
    label: "EMBEDDING",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    icon: <Loader2 className="h-3 w-3 animate-spin text-amber-400" />,
  },
  stale: {
    label: "STALE",
    color: "text-red-400 bg-red-500/10 border-red-500/20",
    icon: <AlertTriangle className="h-3 w-3 text-red-400" />,
  },
};

export function SystemStatePanel({ repo, services }: SystemStatePanelProps) {
  const buildStatus =
    repo.setup?.result === "succeeded"
      ? "ready"
      : repo.setup?.result === "failed"
        ? "failed"
        : "inactive";

  const buildIcon = {
    ready: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
    failed: <XCircle className="h-3.5 w-3.5 text-red-400" />,
    inactive: <Activity className="h-3.5 w-3.5 text-muted-foreground" />,
  }[buildStatus];

  const buildColor = {
    ready: "text-emerald-400",
    failed: "text-red-400",
    inactive: "text-muted-foreground",
  }[buildStatus];

  const buildLabel = {
    ready: "READY",
    failed: "FAILED",
    inactive: "INACTIVE",
  }[buildStatus];

  const embedCfg = embedStatusConfig[repo.chinvexStatus?.status ?? "idle"] ?? embedStatusConfig.idle;
  const gitDirty = repo.git?.status === "dirty";

  return (
    <Panel title="SYSTEM STATE" subtitle="Operational State">
      <div className="flex flex-col gap-5">
        {/* ── Build Status ─────────────────────────────────────── */}
        <section className="rounded-sm border border-border bg-secondary/30 p-3">
          <p className="mb-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Build Status
          </p>

          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {buildIcon}
              <span
                className={`font-mono text-xs font-semibold ${buildColor}`}
              >
                {buildLabel}
              </span>
            </div>
            {repo.setup?.last_attempt && (
              <span className="font-mono text-[10px] text-muted-foreground">
                Last: {timeAgo(repo.setup.last_attempt)}
              </span>
            )}
          </div>

          {buildStatus === "failed" && repo.setup?.error && (
            <div className="mb-2.5 flex items-start gap-2 rounded-sm border border-red-500/20 bg-red-500/5 px-3 py-2">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
              <code className="font-mono text-[10px] leading-relaxed text-red-400">
                {repo.setup?.error}
              </code>
            </div>
          )}

          <div className="mb-2.5 flex items-center gap-2">
            <Layers className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-[10px] text-muted-foreground">
              Shim:
            </span>
            <span
              className={`font-mono text-[10px] font-semibold ${(repo.shimCount ?? 0) > 0 ? "text-emerald-400" : "text-muted-foreground"}`}
            >
              {(repo.shimCount ?? 0) > 0
                ? `Active (${repo.shimCount})`
                : "No shim"}
            </span>
          </div>

          <div className="flex gap-2">
            {buildStatus === "ready" && (
              <>
                <button
                  type="button"
                  disabled={!repo.testCommand}
                  className="flex items-center gap-1.5 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 font-mono text-[10px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-30"
                  title={repo.testCommand || "No test command configured"}
                >
                  <Play className="h-3 w-3" />
                  Run Tests
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                >
                  <Layers className="h-3 w-3" />
                  Generate Shim
                </button>
              </>
            )}
            {buildStatus === "failed" && (
              <>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/10 px-2.5 py-1.5 font-mono text-[10px] font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry Setup
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-400"
                >
                  <Search className="h-3 w-3" />
                  Investigate
                </button>
              </>
            )}
          </div>
        </section>

        {/* ── Vector Store ─────────────────────────────────────── */}
        <section className="rounded-sm border border-border bg-secondary/30 p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Vector Store
              </span>
            </div>
            <span
              className={`flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-semibold ${embedCfg.color}`}
            >
              {embedCfg.icon}
              {embedCfg.label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="mb-0.5 font-mono text-[9px] uppercase text-muted-foreground/70">
                Context
              </p>
              <p className="font-mono text-[11px] text-foreground">
                {repo.chinvexStatus?.context ?? "—"}
              </p>
            </div>
            <div>
              <p className="mb-0.5 font-mono text-[9px] uppercase text-muted-foreground/70">
                Files Indexed
              </p>
              <p className="font-mono text-[11px] text-foreground">
                {repo.chinvexStatus?.files_processed?.toLocaleString() ?? "—"}
              </p>
            </div>
            <div>
              <p className="mb-0.5 font-mono text-[9px] uppercase text-muted-foreground/70">
                Last Updated
              </p>
              <p className="flex items-center gap-1 font-mono text-[11px] text-foreground">
                <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                {repo.chinvexStatus?.updated_at ? timeAgo(repo.chinvexStatus.updated_at) : "—"}
              </p>
            </div>
          </div>
        </section>

        {/* ── Repository ───────────────────────────────────────── */}
        <section className="rounded-sm border border-border bg-secondary/30 p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Repository
              </span>
            </div>
            <span
              className={`rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-semibold ${
                gitDirty
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {gitDirty ? "DIRTY" : "CLEAN"}
            </span>
          </div>

          <div className="mb-2.5 grid grid-cols-3 gap-3">
            <div>
              <p className="mb-0.5 font-mono text-[9px] uppercase text-muted-foreground/70">
                Branch
              </p>
              <p className="font-mono text-[11px] text-foreground">
                {repo.git?.branch ?? "—"}
              </p>
            </div>
            <div>
              <p className="mb-0.5 font-mono text-[9px] uppercase text-muted-foreground/70">
                Ahead
              </p>
              <p className="flex items-center gap-1 font-mono text-[11px] text-foreground">
                <ArrowUp
                  className={`h-2.5 w-2.5 ${(repo.git?.ahead ?? 0) > 0 ? "text-emerald-400" : "text-muted-foreground/40"}`}
                />
                {repo.git?.ahead ?? 0}
              </p>
            </div>
            <div>
              <p className="mb-0.5 font-mono text-[9px] uppercase text-muted-foreground/70">
                Behind
              </p>
              <p className="flex items-center gap-1 font-mono text-[11px] text-foreground">
                <ArrowDown
                  className={`h-2.5 w-2.5 ${(repo.git?.behind ?? 0) > 0 ? "text-amber-400" : "text-muted-foreground/40"}`}
                />
                {repo.git?.behind ?? 0}
              </p>
            </div>
          </div>

          <div className="mb-3 flex gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
            >
              <GitCommit className="h-3 w-3" />
              Commit
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400"
            >
              <Upload className="h-3 w-3" />
              Push
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-400"
            >
              <Download className="h-3 w-3" />
              Pull
            </button>
          </div>

          {/* Recent commits */}
          {repo.recentCommits && repo.recentCommits.length > 0 && (
            <div className="border-t border-border/50 pt-2.5">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70">
                Recent Commits
              </p>
              <div className="flex flex-col gap-0.5">
                {repo.recentCommits.slice(0, 5).map((c) => (
                <div
                  key={c.hash}
                  className="flex items-center gap-2 rounded-sm px-1 py-1"
                >
                  <code className="shrink-0 font-mono text-[10px] text-primary">
                    {c.hash.slice(0, 7)}
                  </code>
                  <p className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                    {c.message}
                  </p>
                  <span className="shrink-0 font-mono text-[9px] text-muted-foreground/40">
                    {c.author}
                  </span>
                  <span className="shrink-0 font-mono text-[9px] text-muted-foreground/40">
                    {c.date ? timeAgo(c.date) : "—"}
                  </span>
                </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── Protocols (only if matching services exist) ──────── */}
        {services.length > 0 && (
          <section>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Protocols
            </p>
            <div className="flex flex-col gap-2">
              {services.map((svc) => {
                const cfg = statusConfig[svc.status];
                return (
                  <div
                    key={svc.name}
                    className={`flex items-center gap-3 rounded-sm border border-border px-3 py-2.5 ${
                      svc.status === "degraded"
                        ? "border-amber-500/20 bg-amber-500/5"
                        : "bg-secondary/30"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${cfg.dot}`}
                    />
                    <span className="min-w-0 flex-1 font-mono text-xs text-foreground">
                      {svc.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        <Cpu className="mr-1 inline h-2.5 w-2.5" />
                        {svc.cpu ?? 0}%
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        <HardDrive className="mr-1 inline h-2.5 w-2.5" />
                        {Math.round((svc.memory ?? 0) / 1024 / 1024)}MB
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
          </section>
        )}
      </div>
    </Panel>
  );
}
