import { Card, CardContent } from "@/components/ui/card";
import { Bug, AlertTriangle, AlertOctagon, CheckCircle2 } from "lucide-react";
import type { DashboardStats } from "@/types";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const { t } = useLanguage();

  const cards = [
    {
      title: t('dashboard.stats.totalBugs'),
      value: stats.totalBugs,
      icon: Bug,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: t('dashboard.stats.openBugs'),
      value: stats.openBugs,
      icon: AlertTriangle,
      color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    },
    {
      title: t('dashboard.stats.criticalBugs'),
      value: stats.criticalBugs,
      icon: AlertOctagon,
      color: "text-red-500 bg-red-500/10 border-red-500/20 animate-pulse",
    },
    {
      title: t('dashboard.stats.fixedToday'),
      value: stats.fixedToday,
      icon: CheckCircle2,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
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
