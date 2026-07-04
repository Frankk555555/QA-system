"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BugSeverityLabels } from "@/types";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface SeverityChartProps {
  data: { severity: string; count: number }[];
}

const COLORS: Record<string, string> = {
  CRITICAL: "hsl(0 84% 60%)",
  MAJOR: "hsl(25 95% 53%)",
  MEDIUM: "hsl(45 93% 47%)",
  MINOR: "hsl(217 91% 60%)",
  TRIVIAL: "hsl(215 20% 65%)",
};

export function SeverityChart({ data }: SeverityChartProps) {
  const { t } = useLanguage();

  if (data.length === 0) {
    return (
      <Card className="glass border-border/50 col-span-3">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wider">{t('dashboard.charts.severityBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
          No data available
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    name: BugSeverityLabels[d.severity as keyof typeof BugSeverityLabels] || d.severity,
    count: d.count,
    fill: COLORS[d.severity] || "hsl(217 33% 25%)",
  }));

  return (
    <Card className="glass border-border/50 col-span-3">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wider">{t('dashboard.charts.severityBreakdown')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(222 47% 8%)",
                  border: "1px solid hsl(217 33% 17%)",
                  borderRadius: "8px",
                  color: "hsl(210 40% 98%)",
                }}
                cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-5 gap-2 mt-4 px-2">
          {chartData.map((entry) => (
            <div key={entry.name} className="text-center">
              <p className="text-[10px] text-muted-foreground truncate">{entry.name}</p>
              <p className="text-sm font-bold mt-1" style={{ color: entry.fill }}>
                {entry.count}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
