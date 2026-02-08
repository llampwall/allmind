"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Server, Cpu, HardDrive, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Pm2Card } from "@/components/protocols/pm2-card";
import { HealthCheckCard } from "@/components/protocols/health-check-card";
import { useAllmind } from "@/hooks/use-allmind";
import { fetchServices, rebootSystem } from "@/lib/api";
import type { ApiService } from "@/lib/types";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function ProtocolsPage() {
  const { operations, refresh } = useAllmind();
  const [services, setServices] = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch services data
  useEffect(() => {
    async function loadServices() {
      try {
        const data = await fetchServices();
        setServices(data);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const handleRefresh = useCallback(() => {
    refresh();
    fetchServices().then(setServices).catch(console.error);
  }, [refresh]);

  const handleReboot = useCallback(() => {
    if (
      window.confirm(
        "⚠ SYSTEM REBOOT\n\nThis will restart the UI.\nAre you sure?",
      )
    ) {
      rebootSystem();
    }
  }, []);

  // Filter PM2 and HTTP services
  const pm2Services = services.filter((s) => s.type === "pm2");
  const httpServices = services.filter((s) => s.type === "http");

  const stats = useMemo(() => {
    const total = pm2Services.length;
    const online = pm2Services.filter((p) => p.status === "online").length;
    const stopped = pm2Services.filter((p) => p.status === "stopped").length;
    const errored = pm2Services.filter((p) => p.status === "errored" || p.status === "error").length;
    const totalMemory = pm2Services.reduce((sum, p) => sum + (p.memory || 0), 0);
    const totalCpu = pm2Services.reduce((sum, p) => sum + (p.cpu || 0), 0);
    return { total, online, stopped, errored, totalMemory, totalCpu };
  }, [pm2Services]);

  const healthOnline = httpServices.filter((h) => h.status === "online").length;
  const healthOffline = httpServices.filter((h) => h.status === "error" || h.status === "offline").length;

  // Use first 6 operations for quick access
  const quickAccessOps = operations.slice(0, 6);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="font-mono text-xs text-muted-foreground">
            LOADING PROTOCOLS...
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
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-3">
            <Server className="h-4 w-4 text-primary" />
            <h1 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
              Protocols
            </h1>
            <span className="rounded-sm bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
              PM2 + HEALTH
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex flex-col gap-6">
            {/* PM2 Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  PM2 Processes
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span className="font-mono text-xs text-muted-foreground">
                      {stats.online}
                    </span>
                  </div>
                  {stats.stopped > 0 && (
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                      <span className="font-mono text-xs text-muted-foreground">
                        {stats.stopped}
                      </span>
                    </div>
                  )}
                  {stats.errored > 0 && (
                    <div className="flex items-center gap-1.5">
                      <XCircle className="h-3 w-3 text-red-500" />
                      <span className="font-mono text-xs text-muted-foreground">
                        {stats.errored}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-sm border border-border bg-card p-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-3 w-3 text-primary" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Total CPU
                    </span>
                  </div>
                  <div className="mt-2 font-mono text-lg font-semibold text-foreground">
                    {stats.totalCpu.toFixed(1)}%
                  </div>
                </div>
                <div className="rounded-sm border border-border bg-card p-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-3 w-3 text-primary" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Total MEM
                    </span>
                  </div>
                  <div className="mt-2 font-mono text-lg font-semibold text-foreground">
                    {formatBytes(stats.totalMemory)}
                  </div>
                </div>
              </div>

              {/* PM2 Process Cards */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {pm2Services.map((process) => (
                  <Pm2Card key={process.id} process={process} />
                ))}
              </div>
            </div>

            {/* Health Checks Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  Health Checks
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span className="font-mono text-xs text-muted-foreground">
                      {healthOnline}
                    </span>
                  </div>
                  {healthOffline > 0 && (
                    <div className="flex items-center gap-1.5">
                      <XCircle className="h-3 w-3 text-red-500" />
                      <span className="font-mono text-xs text-muted-foreground">
                        {healthOffline}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Health Check Cards */}
              <div className="flex flex-col gap-3">
                {httpServices.map((check) => (
                  <HealthCheckCard key={check.id} check={check} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
