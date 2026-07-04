import { cn } from "@/lib/utils";
import { BugSeverity, BugSeverityLabels } from "@/types";

const severityColors: Record<string, string> = {
  CRITICAL: "bg-critical/15 text-critical border-critical/30",
  MAJOR: "bg-major/15 text-major border-major/30",
  MEDIUM: "bg-medium/15 text-medium border-medium/30",
  MINOR: "bg-minor/15 text-minor border-minor/30",
  TRIVIAL: "bg-trivial/15 text-trivial border-trivial/30",
};

const severityIcons: Record<string, string> = {
  CRITICAL: "▲",
  MAJOR: "▲",
  MEDIUM: "■",
  MINOR: "▼",
  TRIVIAL: "▼",
};

interface SeverityBadgeProps {
  severity: string;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border",
        severityColors[severity] ||
          "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      <span className="text-[10px]">{severityIcons[severity] || "●"}</span>
      {BugSeverityLabels[severity as BugSeverity] || severity}
    </span>
  );
}
