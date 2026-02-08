"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  FolderGit2,
  LayoutDashboard,
  RefreshCw,
  RotateCcw,
  Server,
  AlertTriangle,
  X,
} from "lucide-react";
import type { Operation } from "@/lib/types";

interface SidebarProps {
  quickAccessOps: Operation[];
  onRefresh: () => void;
  onReboot: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const statusColor: Record<string, string> = {
  healthy: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
};

const navItems = [
  { label: "Mainframe", icon: LayoutDashboard, href: "/" },
  { label: "Data Center", icon: Database, href: "/data-center" },
  { label: "Operations", icon: FolderGit2, href: "/operations" },
  { label: "Protocols", icon: Server, href: "/protocols" },
];

export function Sidebar({ quickAccessOps, onRefresh, onReboot, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        flex h-screen w-60 shrink-0 flex-col border-r border-border bg-[hsl(220,22%,5%)] font-mono
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
      {/* ALLMIND Title */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-primary/40 bg-primary/10">
          <span className="text-xs font-bold text-primary">A</span>
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-bold tracking-widest text-foreground">
            ALLMIND
          </h1>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            System Controller
          </p>
        </div>
        {/* Close button (mobile only) */}
        <button
          onClick={onClose}
          className="md:hidden rounded-sm p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3 py-4">
        <p className="mb-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href) && item.href !== "#";
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 rounded-sm px-3 py-2 text-xs transition-colors ${
                isActive
                  ? "border border-primary/20 bg-primary/10 text-primary"
                  : "border border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-border" />

      {/* Quick Access */}
      <div className="flex flex-col gap-0.5 px-3 py-4">
        <p className="mb-2 px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          Quick Access
        </p>
        {quickAccessOps.map((op) => {
          const isActive = pathname === `/operations/${encodeURIComponent(op.name)}`;
          return (
            <Link
              key={op.id}
              href={`/operations/${encodeURIComponent(op.name)}`}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 rounded-sm px-3 py-2 text-xs transition-colors ${
                isActive
                  ? "border border-primary/20 bg-primary/10 text-primary"
                  : "border border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${statusColor[op.status]}`}
              />
              <span className="truncate">{op.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Actions */}
      <div className="flex flex-col gap-2 border-t border-border px-3 py-4">
        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-3 rounded-sm border border-border bg-transparent px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Data Refresh
        </button>
        <button
          type="button"
          onClick={onReboot}
          className="flex items-center gap-3 rounded-sm border border-destructive/30 bg-transparent px-3 py-2 text-xs text-destructive transition-colors hover:bg-destructive/10"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          System Reboot
          <AlertTriangle className="ml-auto h-3 w-3" />
        </button>
      </div>
    </aside>
    </>
  );
}
