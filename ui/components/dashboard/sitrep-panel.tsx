"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Zap,
} from "lucide-react";
import { Panel } from "./panel";
import type { Directive, CompletedOp } from "@/lib/types";

interface SitrepPanelProps {
  directives: Directive[];
  completedOps?: CompletedOp[];
}

const priorityColor: Record<string, string> = {
  critical: "text-red-500",
  high: "text-amber-500",
  medium: "text-muted-foreground",
  low: "text-muted-foreground",
};

export function SitrepPanel({ directives }: SitrepPanelProps) {
  const upNext = directives.filter((d) => d.isUpNext && !d.completed);
  const blockers = directives.filter((d) => d.isBlocker && !d.completed);
  const highROI = directives.filter((d) => d.isHighROI && !d.completed);

  return (
    <Panel title="SITREP" subtitle="Priority Overview">
      <div className="flex flex-col gap-5">
        {/* Critical Blockers */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-red-500">
              Critical Blockers
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              ({blockers.length})
            </span>
          </div>
          {blockers.length === 0 ? (
            <p className="px-3 font-mono text-[11px] text-muted-foreground/50">
              No blockers
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {blockers.map((d) => (
                <div
                  key={d.id}
                  className="flex items-start gap-2 rounded-sm border border-red-500/20 bg-red-500/5 px-3 py-2"
                >
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-foreground">
                      {d.title}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {d.operation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Up Next */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Clock className="h-3 w-3 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
              Up Next
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              ({upNext.length})
            </span>
          </div>
          {upNext.length === 0 ? (
            <p className="px-3 font-mono text-[11px] text-muted-foreground/50">
              No upcoming directives
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {upNext.map((d) => (
                <div
                  key={d.id}
                  className="flex items-start gap-2 rounded-sm border border-border bg-secondary/50 px-3 py-2"
                >
                  <span
                    className={`mt-0.5 font-mono text-[10px] font-semibold ${priorityColor[d.priority]}`}
                  >
                    {d.priority.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-foreground">
                      {d.title}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {d.operation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High ROI */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-3 w-3 text-amber-500" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-amber-500">
              High ROI
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              ({highROI.length})
            </span>
          </div>
          {highROI.length === 0 ? (
            <p className="px-3 font-mono text-[11px] text-muted-foreground/50">
              No high-ROI items
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {highROI.map((d) => (
                <div
                  key={d.id}
                  className="flex items-start gap-2 rounded-sm border border-amber-500/20 bg-amber-500/5 px-3 py-2"
                >
                  <ArrowUpRight className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-foreground">
                      {d.title}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {d.operation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
