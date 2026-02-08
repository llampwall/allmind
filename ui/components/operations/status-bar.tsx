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
  Menu,
} from "lucide-react";
import type { Repo } from "@/lib/types";

interface StatusBarProps {
  repo: ApiRepo;
  onMenuClick?: () => void;
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

export function StatusBar({ repo, onMenuClick }: StatusBarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const status = statusConfig[repo.status] ?? statusConfig.active;

  return (
    <div className="flex items-center gap-2 md:gap-3 border-b border-border bg-card px-3 md:px-4 py-3">
      {/* Hamburger menu (mobile only) */}
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden flex items-center justify-center rounded-sm p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Back button */}
      <button
        type="button"
        onClick={() => router.push("/")}
        className="hidden md:flex items-center justify-center rounded-sm border border-border bg-transparent p-1.5 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        aria-label="Return to Mainframe"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
      </button>

      {/* Repo identity */}
      <div className="mr-1 min-w-0 flex-shrink">
        <h1 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground truncate">
          {repo.name}
        </h1>
        <p className="font-mono text-[10px] text-muted-foreground truncate hidden md:block">
          {repo.path}
        </p>
      </div>

      {/* Status badge */}
      <span className={`flex items-center gap-1.5 font-mono text-[10px] font-semibold ${status.textColor} flex-shrink-0`}>
        <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${status.dotColor}`} />
        <span className="hidden sm:inline">{status.label}</span>
      </span>

      <span className="hidden md:block h-4 w-px bg-border flex-shrink-0" />

      {/* Tags - wrap on mobile, hidden on very small screens */}
      <div className="hidden sm:flex flex-wrap gap-1.5 items-center">
        {repo.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-sm border border-border/50 bg-card px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/70 whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
        {repo.tags.length > 3 && (
          <span className="font-mono text-[9px] text-muted-foreground/50">
            +{repo.tags.length - 3}
          </span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Clock - hidden on mobile */}
      <span className="hidden lg:block font-mono text-[10px] text-muted-foreground flex-shrink-0">
        SYS.CLOCK <SystemClock />
      </span>

      <span className="hidden lg:block h-4 w-px bg-border flex-shrink-0" />

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
