"use client";

import { useState } from "react";
import {
  Bot,
  Check,
  ChevronDown,
  OctagonX,
  Play,
  Plus,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import { Panel } from "@/components/dashboard/panel";
import type { ActiveAgent, Directive, Priority } from "@/lib/types";

interface TaskOpsPanelProps {
  directives: Directive[];
  agents: ActiveAgent[];
  operationName: string;
  onToggle: (id: string) => void;
  onAdd: (title: string, operation: string, priority: Priority) => void;
  onAbort: (id: string) => void;
  onDelete?: (id: string) => void;
  onExecute?: (directive: Directive) => void;
}

const priorityIndicator: Record<string, { color: string; ring: string }> = {
  critical: { color: "bg-red-500", ring: "ring-red-500/30" },
  high: { color: "bg-amber-500", ring: "ring-amber-500/30" },
  medium: { color: "bg-muted-foreground", ring: "ring-muted-foreground/20" },
  low: { color: "bg-muted-foreground/40", ring: "ring-muted-foreground/10" },
};

const agentBadge: Record<
  string,
  { label: string; color: string; bg: string }
> = {
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

export function TaskOpsPanel({
  directives,
  agents,
  operationName,
  onToggle,
  onAdd,
  onAbort,
  onDelete,
  onExecute,
}: TaskOpsPanelProps) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");

  function handleSubmit() {
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim(), operationName, newPriority);
    setNewTitle("");
    setNewPriority("medium");
    setShowNewForm(false);
  }

  const sorted = [...directives].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const order: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return order[a.priority] - order[b.priority];
  });

  return (
    <Panel
      title="TASK OPS"
      subtitle={`${operationName} Tasks`}
      headerAction={
        <button
          type="button"
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-1 rounded-sm border border-primary/20 bg-primary/10 px-2 py-1 font-mono text-[10px] text-primary transition-colors hover:bg-primary/20"
        >
          <Plus className="h-3 w-3" />
          New Directive
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        {/* ── Active Ops (only renders if agents present) ──── */}
        {agents.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                Active Ops
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                ({agents.length})
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {agents.map((agent) => {
                const badge = agentBadge[agent.agentType];
                return (
                  <div
                    key={agent.id}
                    className="rounded-sm border border-primary/15 bg-primary/5 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-semibold ${badge.bg} ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                        <code className="font-mono text-[10px] text-muted-foreground">
                          PID:{agent.processId}
                        </code>
                        <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                          <Timer className="h-2.5 w-2.5" />
                          {agent.duration}
                        </span>
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
                    <p className="mb-1.5 text-xs text-foreground">
                      {agent.directive}
                    </p>
                    <div className="flex items-start gap-2 rounded-sm border border-border/50 bg-background px-2.5 py-1.5">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary" />
                      <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                        {agent.currentAction}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── New Directive Form ─────────────────────────── */}
        {showNewForm && (
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-3">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                New Directive
              </span>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Directive description..."
              className="mb-2 w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            <div className="mb-2.5 flex gap-2">
              <div className="flex items-center gap-2 rounded-sm border border-border bg-secondary/50 px-3 py-2 font-mono text-[11px] text-foreground">
                {operationName}
              </div>
              <div className="relative flex-1">
                <select
                  value={newPriority}
                  onChange={(e) =>
                    setNewPriority(e.target.value as Priority)
                  }
                  className="w-full appearance-none rounded-sm border border-border bg-background px-3 py-2 pr-8 font-mono text-[11px] text-foreground focus:border-primary/40 focus:outline-none"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full rounded-sm bg-primary px-3 py-2 font-mono text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Create Directive
            </button>
          </div>
        )}

        {/* ── Directives List ────────────────────────────── */}
        {sorted.length === 0 && agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bot className="mb-2 h-6 w-6 text-muted-foreground/30" />
            <p className="font-mono text-xs text-muted-foreground">
              No directives for this operation
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {sorted.map((d) => {
              const pCfg = priorityIndicator[d.priority];
              return (
                <div
                  key={d.id}
                  className={`group flex items-center gap-2 rounded-sm px-3 py-2 transition-colors hover:bg-secondary/50 ${
                    d.completed ? "opacity-40" : ""
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ring-2 ${pCfg.color} ${pCfg.ring}`}
                  />
                  <button
                    type="button"
                    onClick={() => onToggle(d.id)}
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                      d.completed
                        ? "border-primary/40 bg-primary/20"
                        : "border-border group-hover:border-muted-foreground"
                    }`}
                  >
                    {d.completed && (
                      <Check className="h-2.5 w-2.5 text-primary" />
                    )}
                  </button>
                  <p
                    className={`min-w-0 flex-1 truncate text-xs ${
                      d.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {d.title}
                  </p>
                  {/* Action buttons - only show on hover */}
                  <div className="hidden items-center gap-1 group-hover:flex">
                    {onExecute && !d.completed && (
                      <button
                        type="button"
                        onClick={() => onExecute(d)}
                        className="flex items-center gap-1 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] text-emerald-400 transition-colors hover:bg-emerald-500/20"
                        title="Execute task in Claude"
                      >
                        <Play className="h-3 w-3" />
                        Execute
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(d.id)}
                        className="flex items-center gap-1 rounded-sm border border-destructive/20 bg-destructive/10 px-2 py-1 font-mono text-[10px] text-destructive transition-colors hover:bg-destructive/20"
                        title="Delete task"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Panel>
  );
}
