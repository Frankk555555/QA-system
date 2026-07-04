"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { BugStatusLabels } from "@/types";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface BugStatusChartProps {
  data: { status: string; count: number }[];
}

const COLORS: Record<string, string> = {
  NEW: "hsl(217 91% 60%)",
  OPEN: "hsl(199 89% 48%)",
  ASSIGNED: "hsl(280 65% 60%)",
  IN_PROGRESS: "hsl(25 95% 53%)",
  FIXED: "hsl(160 60% 45%)",
  READY_FOR_TEST: "hsl(45 93% 47%)",
  VERIFIED: "hsl(142 71% 45%)",
  CLOSED: "hsl(215 20% 65%)",
  REJECTED: "hsl(0 84% 60%)",
  DUPLICATE: "hsl(215 20% 45%)",
};

export function BugStatusChart({ data }: BugStatusChartProps) {
  const { t } = useLanguage();

  if (data.length === 0) {
    return (
      <Card className="glass border-border/50 col-span-3">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider">{t('dashboard.charts.bugStatusDistribution')}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
          No data available
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    name: BugStatusLabels[d.status as keyof typeof BugStatusLabels] || d.status,
    value: d.count,
    color: COLORS[d.status] || "hsl(217 33% 25%)",
  }));

  return (
    <Card className="glass border-border/50 col-span-3">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wider">{t('dashboard.charts.bugStatusDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(222 47% 8%)",
                  border: "1px solid hsl(217 33% 17%)",
                  borderRadius: "8px",
                  color: "hsl(210 40% 98%)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 max-h-[100px] overflow-y-auto scrollbar-thin px-2">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-muted-foreground truncate">{entry.name}</span>
              <span className="text-xs font-semibold ml-auto">{entry.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
