import type { ReactNode } from "react";
import { GlowContainer } from "@/components/thegridcn/glow-container";

interface PanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
}

export function Panel({
  title,
  subtitle,
  children,
  headerAction,
  className = "",
}: PanelProps) {
  return (
    <GlowContainer
      intensity="md"
      hover={true}
      className={`flex flex-col rounded-sm p-0 ${className}`}
      style={{ height: "fit-content" }}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <div>
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="font-mono text-[10px] text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {headerAction}
      </div>
      <div className="overflow-auto p-4">{children}</div>
    </GlowContainer>
  );
}
