"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchDirectives,
  fetchProtocols,
  fetchOperations,
  fetchActiveAgents,
  fetchCompletedOps,
  fetchChinvexContexts,
} from "@/lib/api";
import type {
  Directive,
  Protocol,
  Operation,
  ActiveAgent,
  CompletedOp,
  ChinvexContext,
} from "@/lib/types";

interface AllmindState {
  directives: Directive[];
  protocols: Protocol[];
  operations: Operation[];
  activeAgents: ActiveAgent[];
  completedOps: CompletedOp[];
  vectorStores: ChinvexContext[];
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
}

const POLL_INTERVAL = 10_000; // 10s for active data
const SLOW_POLL_INTERVAL = 30_000; // 30s for relatively static data

export function useAllmind() {
  const [state, setState] = useState<AllmindState>({
    directives: [],
    protocols: [],
    operations: [],
    activeAgents: [],
    completedOps: [],
    vectorStores: [],
    loading: true,
    error: null,
    lastRefresh: null,
  });

  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const [directives, protocols, operations, activeAgents, completedOps, vectorStores] =
        await Promise.all([
          fetchDirectives(),
          fetchProtocols(),
          fetchOperations(),
          fetchActiveAgents(),
          fetchCompletedOps(),
          fetchChinvexContexts().catch(() => []), // Gracefully handle if Chinvex is unavailable
        ]);

      if (!mountedRef.current) return;

      setState({
        directives,
        protocols,
        operations,
        activeAgents,
        completedOps,
        vectorStores,
        loading: false,
        error: null,
        lastRefresh: new Date(),
      });
    } catch (err) {
      if (!mountedRef.current) return;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch",
      }));
    }
  }, []);

  // Fast poll for active agents (they change frequently)
  const refreshActive = useCallback(async () => {
    try {
      const activeAgents = await fetchActiveAgents();
      if (!mountedRef.current) return;
      setState((prev) => ({ ...prev, activeAgents }));
    } catch {
      // Silently fail on active polling — full refresh will catch up
    }
  }, []);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  // Full poll every 30s
  useEffect(() => {
    const interval = setInterval(refresh, SLOW_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  // Fast poll active agents every 10s
  useEffect(() => {
    const interval = setInterval(refreshActive, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [refreshActive]);

  return { ...state, refresh };
}
