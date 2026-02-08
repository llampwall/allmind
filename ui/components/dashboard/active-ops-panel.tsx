"use client";

import { Bot, OctagonX, Timer } from "lucide-react";
import { Panel } from "./panel";
import type { ActiveAgent } from "@/lib/types";

interface ActiveOpsPanelProps {
  agents: ActiveAgent[];
  onAbort: (id: string) => void;
}

const agentBadge: Record<string, { label: string; color: string; bg: string }> =
  {
    claude: {
      label: "CLAUDE",
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
    codex: {
      label: "CODEX",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  };

export function ActiveOpsPanel({ agents, onAbort }: ActiveOpsPanelProps) {
  return (
    <Panel
      title="Active Ops"
      subtitle={`${agents.length} Agent${agents.length !== 1 ? "s" : ""} Deployed`}
    >
      <div className="flex flex-col gap-3">
        {agents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bot className="mb-2 h-6 w-6 text-muted-foreground/30" />
            <p className="font-mono text-xs text-muted-foreground">
              No active agents
            </p>
          </div>
        )}
        {agents.map((agent) => {
          const badge = agentBadge[agent.agentType];
          return (
            <div
              key={agent.id}
              className="rounded-sm border border-border bg-secondary/30 p-3"
            >
              {/* Header row */}
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-semibold ${badge.bg} ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <code className="font-mono text-[10px] text-muted-foreground">
                    PID:{agent.processId}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => onAbort(agent.id)}
                  className="flex items-center gap-1 rounded-sm border border-destructive/20 bg-destructive/5 px-2 py-1 font-mono text-[10px] text-destructive transition-colors hover:bg-destructive/15"
                >
                  <OctagonX className="h-3 w-3" />
                  Abort
                </button>
              </div>

              {/* Directive */}
              <p className="mb-1 text-xs text-foreground">{agent.directive}</p>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                  {agent.operation}
                </span>
                <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                  <Timer className="h-2.5 w-2.5" />
                  {agent.duration}
                </span>
              </div>

              {/* Current action */}
              <div className="flex items-start gap-2 rounded-sm border border-border/50 bg-background px-2.5 py-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary" />
                <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {agent.currentAction}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
