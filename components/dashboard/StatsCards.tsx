import { Card, CardContent } from "@/components/ui/card";
import { Bug, AlertTriangle, CheckCircle, FolderKanban, Users } from "lucide-react";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Bugs",
      value: stats.totalBugs,
      icon: Bug,
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      title: "Open Bugs",
      value: stats.openBugs,
      icon: AlertTriangle,
      color: "text-medium bg-medium/10 border-medium/20",
    },
    {
      title: "Critical Bugs",
      value: stats.criticalBugs,
      icon: AlertTriangle,
      color: "text-critical bg-critical/10 border-critical/20 animate-pulse",
    },
    {
      title: "Fixed Today",
      value: stats.fixedToday,
      icon: CheckCircle,
      color: "text-status-fixed bg-status-fixed/10 border-status-fixed/20",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="glass overflow-hidden border-border/50">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {card.title}
              </p>
              <p className="text-3xl font-bold tracking-tight">{card.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
