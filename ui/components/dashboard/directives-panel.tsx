"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Circle,
  Plus,
  X,
} from "lucide-react";
import { Panel } from "./panel";
import type { Directive, Operation, Priority } from "@/lib/types";

interface DirectivesPanelProps {
  directives: Directive[];
  operations: Operation[];
  onToggle: (id: string) => void;
  onAdd: (title: string, operation: string, priority: Priority) => void;
}

const priorityIndicator: Record<string, { color: string; ring: string }> = {
  critical: { color: "bg-red-500", ring: "ring-red-500/30" },
  high: { color: "bg-amber-500", ring: "ring-amber-500/30" },
  medium: { color: "bg-muted-foreground", ring: "ring-muted-foreground/20" },
  low: { color: "bg-muted-foreground/40", ring: "ring-muted-foreground/10" },
};

export function DirectivesPanel({
  directives,
  operations,
  onToggle,
  onAdd,
}: DirectivesPanelProps) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOperation, setNewOperation] = useState(operations[0]?.name ?? "");
  const [newPriority, setNewPriority] = useState<Priority>("medium");

  function handleSubmit() {
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim(), newOperation, newPriority);
    setNewTitle("");
    setNewOperation(operations[0]?.name ?? "");
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
      title="Directives"
      subtitle="Task Registry"
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
      <div className="flex flex-col gap-3">
        {/* New Directive Form */}
        {showNewForm && (
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-3">
            <div className="mb-3 flex items-center justify-between">
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
            />
            <div className="mb-3 flex gap-2">
              <div className="relative flex-1">
                <select
                  value={newOperation}
                  onChange={(e) => setNewOperation(e.target.value)}
                  className="w-full appearance-none rounded-sm border border-border bg-background px-3 py-2 pr-8 font-mono text-[11px] text-foreground focus:border-primary/40 focus:outline-none"
                >
                  {operations.map((op) => (
                    <option key={op.id} value={op.name}>
                      {op.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              </div>
              <div className="relative">
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Priority)}
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

        {/* Directive List */}
        <div className="flex flex-col gap-1">
          {sorted.map((d) => {
            const pCfg = priorityIndicator[d.priority];
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onToggle(d.id)}
                className={`group flex items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors hover:bg-secondary/50 ${
                  d.completed ? "opacity-40" : ""
                }`}
              >
                {/* Priority indicator */}
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ring-2 ${pCfg.color} ${pCfg.ring}`}
                />
                {/* Checkbox */}
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                    d.completed
                      ? "border-primary/40 bg-primary/20"
                      : "border-border group-hover:border-muted-foreground"
                  }`}
                >
                  {d.completed && <Check className="h-2.5 w-2.5 text-primary" />}
                </span>
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-xs ${
                      d.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {d.title}
                  </p>
                </div>
                {/* Operation label */}
                <span className="shrink-0 rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                  {d.operation}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
