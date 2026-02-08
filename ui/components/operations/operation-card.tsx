"use client";

import Link from "next/link";
import {
  GitBranch,
  Bot,
  Brain,
  Hexagon,
  FileCode2,
  FlaskConical,
} from "lucide-react";
import { GlowContainer } from "@/components/thegridcn/glow-container";
import type { ApiRepo } from "@/lib/types";

interface OperationCardProps {
  repo: ApiRepo;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const ms = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const statusConfig: Record<
  string,
  { label: string; dot: string; text: string; border: string; bg: string }
> = {
  active: {
    label: "ACTIVE",
    dot: "bg-emerald-500",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/10",
  },
  stable: {
    label: "STABLE",
    dot: "bg-sky-500",
    text: "text-sky-400",
    border: "border-sky-500/20",
    bg: "bg-sky-500/10",
  },
  archived: {
    label: "ARCHIVED",
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
    border: "border-border",
    bg: "bg-muted",
  },
};

const depthConfig: Record<
  string,
  { label: string; text: string; border: string; bg: string }
> = {
  full: {
    label: "FULL",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/10",
  },
  light: {
    label: "LIGHT",
    text: "text-amber-400",
    border: "border-amber-500/20",
    bg: "bg-amber-500/10",
  },
};

const buildDot: Record<string, string> = {
  succeeded: "bg-emerald-500",
  failed: "bg-red-500",
};

// Tool detection helpers (mock data for now - could be inferred from repo data)
const hasTools = {
  claudeProject: (repo: ApiRepo) => false, // TODO: detect .claude directory
  memory: (repo: ApiRepo) => false, // TODO: detect docs/memory
  node: (repo: ApiRepo) => false, // TODO: detect package.json
  python: (repo: ApiRepo) => false, // TODO: detect requirements.txt
  venv: (repo: ApiRepo) => false, // TODO: detect .venv
};

const toolEntries: {
  key: keyof typeof hasTools;
  icon: typeof Bot;
  label: string;
}[] = [
  { key: "claudeProject", icon: Bot, label: "Claude" },
  { key: "memory", icon: Brain, label: "Memory" },
  { key: "node", icon: Hexagon, label: "Node" },
  { key: "python", icon: FileCode2, label: "Python" },
  { key: "venv", icon: FlaskConical, label: "Venv" },
];

export function OperationCard({ repo }: OperationCardProps) {
  const st = statusConfig[repo.status ?? "active"] ?? statusConfig.active;
  const dp = depthConfig[repo.chinvex_depth ?? "light"] ?? depthConfig.light;
  const lastCommit = repo.recentCommits?.[0];
  const buildColor = buildDot[repo.setup?.result ?? ""] ?? "bg-muted-foreground";
  const isArchived = repo.status === "archived";
  const shimCount = 0; // TODO: get from repo data

  return (
    <GlowContainer
      intensity="sm"
      hover={true}
      className="p-0"
    >
      <Link
        href={`/operations/${encodeURIComponent(repo.name)}`}
        className={`group relative flex flex-col gap-3 rounded-sm p-4 font-mono transition-colors
          ${isArchived ? "opacity-60" : "hover:bg-primary/5"}
        `}
      >
      {/* Row 1: name + status + embed depth */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
            {repo.name}
          </h3>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {repo.path}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[9px] font-semibold ${dp.text} ${dp.border} ${dp.bg}`}
          >
            {dp.label}
          </span>
          <span
            className={`flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[9px] font-semibold ${st.text} ${st.border} ${st.bg}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>
      </div>

      {/* Row 2: tags */}
      {repo.tags && repo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {repo.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-sm bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Row 3: git + build */}
      <div className="flex items-center gap-3 text-[10px]">
        {repo.git?.branch && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <GitBranch className="h-3 w-3" />
            {repo.git.branch}
          </span>
        )}
        {repo.git?.status && (
          <span
            className={`rounded-sm border px-1.5 py-0.5 text-[9px] font-semibold ${
              repo.git.status === "clean"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-amber-500/20 bg-amber-500/10 text-amber-400"
            }`}
          >
            {repo.git.status === "clean" ? "CLEAN" : "DIRTY"}
          </span>
        )}
        <span className="flex items-center gap-1 text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${buildColor}`} />
          Build
        </span>
        {shimCount > 0 && (
          <span className="rounded-sm border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400">
            {shimCount} SHIM{shimCount > 1 ? "S" : ""}
          </span>
        )}
      </div>

      {/* Row 4: last commit */}
      {lastCommit && (
        <div className="flex items-baseline gap-2 text-[10px]">
          <span className="text-primary/60">{lastCommit.hash.slice(0, 7)}</span>
          <span className="flex-1 truncate text-muted-foreground">
            {lastCommit.message}
          </span>
          <span className="shrink-0 text-muted-foreground/60">
            {timeAgo(lastCommit.date)}
          </span>
        </div>
      )}

      {/* Row 5: tooling - TODO: implement tool detection */}
      <div className="flex items-center gap-2 border-t border-border pt-2">
        {toolEntries.map(({ key, icon: Icon, label }) =>
          hasTools[key](repo) ? (
            <span
              key={key}
              className="flex items-center gap-1 text-[9px] text-muted-foreground"
              title={label}
            >
              <Icon className="h-3 w-3" />
            </span>
          ) : null,
        )}
      </div>
      </Link>
    </GlowContainer>
  );
}
