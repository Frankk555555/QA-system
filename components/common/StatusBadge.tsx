import { cn } from "@/lib/utils";
import { BugStatus, BugStatusLabels } from "@/types";

const statusColors: Record<string, string> = {
  NEW: "bg-status-new/15 text-status-new border-status-new/30",
  OPEN: "bg-status-open/15 text-status-open border-status-open/30",
  ASSIGNED: "bg-status-assigned/15 text-status-assigned border-status-assigned/30",
  IN_PROGRESS: "bg-status-in-progress/15 text-status-in-progress border-status-in-progress/30",
  FIXED: "bg-status-fixed/15 text-status-fixed border-status-fixed/30",
  READY_FOR_TEST: "bg-status-ready-for-test/15 text-status-ready-for-test border-status-ready-for-test/30",
  VERIFIED: "bg-status-verified/15 text-status-verified border-status-verified/30",
  CLOSED: "bg-status-closed/15 text-status-closed border-status-closed/30",
  REJECTED: "bg-status-rejected/15 text-status-rejected border-status-rejected/30",
  DUPLICATE: "bg-status-duplicate/15 text-status-duplicate border-status-duplicate/30",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border",
        statusColors[status] || "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {BugStatusLabels[status as BugStatus] || status}
    </span>
  );
}
