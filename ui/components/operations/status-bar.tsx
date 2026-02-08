"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  FolderOpen,
  Code2,
  Bot,
  Terminal,
} from "lucide-react";
import type { Repo } from "@/lib/types";

interface StatusBarProps {
  repo: ApiRepo;
}

const statusConfig: Record<
  string,
  { label: string; textColor: string; dotColor: string }
> = {
  active: {
    label: "ACTIVE",
    textColor: "text-emerald-400",
    dotColor: "bg-emerald-500",
  },
  stable: {
    label: "STABLE",
    textColor: "text-amber-400",
    dotColor: "bg-amber-500",
  },
  archived: {
    label: "ARCHIVED",
    textColor: "text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
};

const actionItems = [
  { label: "Directory", icon: FolderOpen },
  { label: "Code", icon: Code2 },
  { label: "Claude", icon: Bot },
  { label: "Terminal", icon: Terminal },
];

export function StatusBar({ repo }: StatusBarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const status = statusConfig[repo.status] ?? statusConfig.active;

  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.push("/")}
        className="flex items-center justify-center rounded-sm border border-border bg-transparent p-1.5 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        aria-label="Return to Mainframe"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
      </button>

      {/* Repo identity */}
      <div className="mr-1">
        <h1 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
          {repo.name}
        </h1>
        <p className="font-mono text-[10px] text-muted-foreground">
          {repo.path}
        </p>
      </div>

      {/* Status badge */}
      <span className={`flex items-center gap-1.5 font-mono text-[10px] font-semibold ${status.textColor}`}>
        <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${status.dotColor}`} />
        {status.label}
      </span>

      <span className="h-4 w-px bg-border" />

      {/* Tags */}
      {repo.tags.map((tag) => (
        <span
          key={tag}
          className="rounded-sm border border-border/50 bg-card px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/70"
        >
          {tag}
        </span>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Clock */}
      <span className="font-mono text-[10px] text-muted-foreground">
        SYS.CLOCK <SystemClock />
      </span>

      <span className="h-4 w-px bg-border" />

      {/* Actions Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/10 px-2.5 py-1.5 font-mono text-[10px] font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          <ExternalLink className="h-3 w-3" />
          Open In
          <ChevronDown
            className={`h-3 w-3 transition-transform ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
              onKeyDown={() => {}}
              role="presentation"
            />
            <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-sm border border-border bg-popover py-1 shadow-lg">
              {actionItems.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-[11px] text-foreground transition-colors hover:bg-secondary"
                >
                  <action.icon className="h-3 w-3 text-muted-foreground" />
                  {action.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
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
