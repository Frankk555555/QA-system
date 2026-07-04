import { cn } from "@/lib/utils";
import { BugPriority, BugPriorityLabels } from "@/types";

const priorityColors: Record<string, string> = {
  HIGHEST: "bg-critical/15 text-critical border-critical/30",
  HIGH: "bg-major/15 text-major border-major/30",
  MEDIUM: "bg-medium/15 text-medium border-medium/30",
  LOW: "bg-trivial/15 text-trivial border-trivial/30",
};

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border",
        priorityColors[priority] ||
          "bg-muted text-muted-foreground border-border",
        className
      )}
    >
      {BugPriorityLabels[priority as BugPriority] || priority}
    </span>
  );
}
