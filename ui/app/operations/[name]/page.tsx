"use client";

import { useState, useCallback, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { StatusBar } from "@/components/operations/status-bar";
import { OpSitrepPanel } from "@/components/operations/op-sitrep-panel";
import { SystemStatePanel } from "@/components/operations/system-state-panel";
import { TaskOpsPanel } from "@/components/operations/task-ops-panel";
import { useAllmind } from "@/hooks/use-allmind";
import { fetchRepos, fetchServices, toggleDirective, addDirective, abortAgent, deleteDirective, executeTask, rebootSystem } from "@/lib/api";
import type { ApiRepo, ApiService, Directive, Priority } from "@/lib/types";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function OperationIntelPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const router = useRouter();
  const decodedName = decodeURIComponent(name);

  const { operations, directives, activeAgents, refresh } = useAllmind();
  const [repo, setRepo] = useState<ApiRepo | null>(null);
  const [services, setServices] = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch repo and services data
  useEffect(() => {
    async function loadData() {
      try {
        const [reposData, servicesData] = await Promise.all([
          fetchRepos(),
          fetchServices()
        ]);

        const foundRepo = reposData.find((r) => r.name === decodedName);
        setRepo(foundRepo || null);

        // Find services matching this repo's path
        if (foundRepo) {
          const matchingServices = servicesData.filter((s) =>
            s.cwd === foundRepo.path
          );
          setServices(matchingServices);
        } else {
          setServices([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [decodedName]);

  // Filter directives and agents for this repo - with defensive checks
  const repoDirectives = (directives || []).filter((d) => d.operation === decodedName);
  const repoAgents = (activeAgents || []).filter((a) => a.operation === decodedName);

  const handleToggleDirective = useCallback(
    async (id: string) => {
      const directive = (directives || []).find((d) => d.id === id);
      if (!directive) return;
      await toggleDirective(id, !directive.completed);
      refresh();
    },
    [directives, refresh]
  );

  const handleAddDirective = useCallback(
    async (title: string, operation: string, priority: Priority) => {
      await addDirective(title, operation, priority);
      refresh();
    },
    [refresh]
  );

  const handleAbortAgent = useCallback(
    async (id: string) => {
      await abortAgent(id);
      refresh();
    },
    [refresh]
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
    fetchRepos().then((repos) => {
      const foundRepo = repos.find((r) => r.name === decodedName);
      setRepo(foundRepo || null);
    });
    fetchServices().then((servicesData) => {
      const matchingServices = servicesData.filter((s) => s.cwd === repo?.path);
      setServices(matchingServices);
    });
  }, [refresh, decodedName, repo?.path]);

  const handleReboot = useCallback(() => {
    if (
      window.confirm(
        "⚠ SYSTEM REBOOT\n\nThis will restart the UI.\nAre you sure?",
      )
    ) {
      rebootSystem();
    }
  }, []);

  // Use first 6 operations for quick access - with defensive check
  const quickAccessOps = (operations || []).slice(0, 6);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="font-mono text-xs text-muted-foreground">
            LOADING OPERATION...
          </span>
        </div>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-sm text-destructive">
            OPERATION NOT FOUND: {decodedName}
          </span>
          <button
            type="button"
            onClick={() => router.push("/operations")}
            className="mt-4 rounded-sm border border-border bg-secondary px-4 py-2 font-mono text-xs text-foreground transition-colors hover:bg-secondary/80"
          >
            ← Back to Operations
          </button>
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
        <StatusBar repo={repo} services={services} />

        {/* Intel Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex gap-4">
            <div className="flex w-1/2 flex-col gap-4">
              <OpSitrepPanel directives={repoDirectives} />
              <TaskOpsPanel
                directives={repoDirectives}
                agents={repoAgents}
                onToggle={handleToggleDirective}
                onAdd={handleAddDirective}
                onAbort={handleAbortAgent}
                onDelete={handleDeleteDirective}
                onExecute={handleExecuteTask}
                operationName={decodedName}
              />
            </div>
            <div className="flex w-1/2 flex-col gap-4">
              <SystemStatePanel repo={repo} services={services} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
