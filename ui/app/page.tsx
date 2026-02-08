"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SitrepPanel } from "@/components/dashboard/sitrep-panel";
import { DiagnosticsPanel } from "@/components/dashboard/diagnostics-panel";
import { TaskOpsPanel } from "@/components/operations/task-ops-panel";
import { useAllmind } from "@/hooks/use-allmind";
import {
  toggleDirective,
  addDirective,
  abortAgent,
  deleteDirective,
  executeTask,
  rebootSystem,
} from "@/lib/api";
import type { Directive, Priority } from "@/lib/types";

export default function MainframePage() {
  const {
    directives,
    protocols,
    operations,
    activeAgents,
    completedOps,
    loading,
    error,
    refresh,
  } = useAllmind();

  // Derive quick access from operations (first 6, or you could filter by pinned)
  const quickAccessOps = operations.slice(0, 6);

  const handleToggleDirective = useCallback(
    async (id: string) => {
      const directive = directives.find((d) => d.id === id);
      if (!directive) return;
      await toggleDirective(id, !directive.completed);
      refresh();
    },
    [directives, refresh],
  );

  const handleAddDirective = useCallback(
    async (title: string, operation: string, priority: Priority) => {
      await addDirective(title, operation, priority);
      refresh();
    },
    [refresh],
  );

  const handleAbortAgent = useCallback(
    async (id: string) => {
      await abortAgent(id);
      refresh();
    },
    [refresh],
  );

  const handleDeleteDirective = useCallback(
    async (id: string) => {
      if (window.confirm("Delete this directive?")) {
        await deleteDirective(id);
        refresh();
      }
    },
    [refresh],
  );

  const handleExecuteTask = useCallback(
    async (directive: Directive) => {
      await executeTask(directive.id, directive.title, directive.operation);
    },
    [],
  );

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleReboot = useCallback(() => {
    if (
      window.confirm(
        "⚠ SYSTEM REBOOT\n\nThis will restart all PM2 services.\nAre you sure?",
      )
    ) {
      rebootSystem();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="font-mono text-xs text-muted-foreground">
            INITIALIZING MAINFRAME...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        quickAccessOps={quickAccessOps}
        onRefresh={handleRefresh}
        onReboot={handleReboot}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
              Mainframe
            </h1>
            <span className="rounded-sm bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-4">
            {error && (
              <span className="font-mono text-[10px] text-destructive">
                ⚠ {error}
              </span>
            )}
            <span className="font-mono text-[10px] text-muted-foreground">
              SYS.CLOCK <SystemClock />
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              NOMINAL
            </span>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex gap-4">
            <div className="flex w-1/2 flex-col gap-4">
              <SitrepPanel
                directives={directives}
                completedOps={completedOps}
              />
              <TaskOpsPanel
                directives={directives}
                agents={activeAgents}
                onToggle={handleToggleDirective}
                onAdd={handleAddDirective}
                onAbort={handleAbortAgent}
                onDelete={handleDeleteDirective}
                onExecute={handleExecuteTask}
                operationName="all"
              />
            </div>
            <div className="flex w-1/2 flex-col gap-4">
              <DiagnosticsPanel protocols={protocols} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SystemClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    function update() {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return <span className="text-foreground">{time}</span>;
}
