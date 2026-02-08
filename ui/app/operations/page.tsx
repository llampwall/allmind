"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { FolderGit2, ChevronDown } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { OperationCard } from "@/components/operations/operation-card";
import { fetchRepos, rebootSystem } from "@/lib/api";
import { useAllmind } from "@/hooks/use-allmind";
import type { ApiRepo } from "@/lib/types";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type SortKey = "name" | "status" | "lastCommit";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
  { key: "lastCommit", label: "Last Commit" },
];

export default function OperationsPage() {
  const { operations, refresh } = useAllmind();
  const [repos, setRepos] = useState<ApiRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch full repo data
  useEffect(() => {
    async function loadRepos() {
      try {
        const data = await fetchRepos();
        setRepos(data);
      } catch (error) {
        console.error("Failed to fetch repos:", error);
      } finally {
        setLoading(false);
      }
    }
    loadRepos();
  }, []);

  const sortedRepos = useMemo(() => {
    const list = [...repos];
    switch (sortBy) {
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "status":
        list.sort((a, b) => {
          const aStatus = a.git?.status || "";
          const bStatus = b.git?.status || "";
          return aStatus.localeCompare(bStatus);
        });
        break;
      case "lastCommit":
        list.sort((a, b) => {
          const aDate = a.recentCommits?.[0]?.date ?? "";
          const bDate = b.recentCommits?.[0]?.date ?? "";
          return bDate.localeCompare(aDate);
        });
        break;
    }
    return list;
  }, [repos, sortBy]);

  const handleRefresh = useCallback(() => {
    refresh();
    fetchRepos().then(setRepos).catch(console.error);
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

  // Use first 6 operations for quick access
  const quickAccessOps = operations.slice(0, 6);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="font-mono text-xs text-muted-foreground">
            LOADING OPERATIONS...
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
        {/* Header bar */}
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-3">
            <FolderGit2 className="h-4 w-4 text-primary" />
            <h1 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
              Operations
            </h1>
            <span className="rounded-sm bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
              {repos.length} REPOS
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-sm border border-border bg-secondary/30 px-3 py-1.5 font-mono text-xs text-foreground transition-colors hover:bg-secondary/50"
              >
                Sort: {sortOptions.find((o) => o.key === sortBy)?.label}
                <ChevronDown className="h-3 w-3" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 rounded-sm border border-border bg-card shadow-lg">
                  {sortOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => {
                        setSortBy(option.key);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left font-mono text-xs transition-colors hover:bg-secondary ${
                        sortBy === option.key
                          ? "bg-primary/10 text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Operations Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {sortedRepos.map((repo) => (
              <OperationCard key={repo.name} repo={repo} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
