"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Loader2, TrendingUp, Clock, ShieldCheck, Bug, Award, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { UserAvatar } from "@/components/common/UserAvatar";
import { PlatformLabels } from "@/types";
import { useLanguage } from "@/lib/contexts/LanguageContext";

interface ReportData {
  avgResolutionTimeHours: number;
  bugsPerProject: { name: string; count: number }[];
  topReporters: { name: string; avatar?: string | null; count: number }[];
  topDevelopers: { name: string; avatar?: string | null; count: number }[];
  severityData: { severity: string; count: number }[];
  platformData: { platform: string; count: number }[];
  trendData: { date: string; opened: number; closed: number }[];
}

const PLATFORM_COLORS = [
  "hsl(217 91% 60%)",
  "hsl(160 60% 45%)",
  "hsl(30 80% 55%)",
  "hsl(280 65% 60%)",
  "hsl(340 75% 55%)",
  "hsl(199 89% 48%)",
  "hsl(25 95% 53%)",
  "hsl(142 71% 45%)",
];

export default function ReportsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Failed to load reports metrics data.</h2>
        <p className="text-muted-foreground mt-1">Please check your database seeds or try again.</p>
      </div>
    );
  }

  const platformChartData = data.platformData
    .filter((d) => d.count > 0)
    .map((d, index) => ({
      name: PlatformLabels[d.platform as keyof typeof PlatformLabels] || d.platform,
      value: d.count,
      color: PLATFORM_COLORS[index % PLATFORM_COLORS.length],
    }));

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <PageHeader
        title={t('reports.title')}
        description={t('reports.description')}
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('reports.velocity')}</p>
              <p className="text-2xl font-bold mt-0.5">{data.avgResolutionTimeHours} {t('reports.hours')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-status-fixed/10 border border-status-fixed/20 flex items-center justify-center text-status-fixed shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('reports.activeScope')}</p>
              <p className="text-2xl font-bold mt-0.5">
                {data.bugsPerProject.length > 0
                  ? data.bugsPerProject.reduce((max, p) => (p.count > max.count ? p : max), data.bugsPerProject[0]).name
                  : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-medium/10 border border-medium/20 flex items-center justify-center text-medium shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('reports.totalProjects')}</p>
              <p className="text-2xl font-bold mt-0.5">{data.bugsPerProject.length} {t('reports.projects')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 md:grid-cols-6">
        {/* Trend Area Chart */}
        <Card className="glass border-border/50 md:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {t('reports.volumeTrends')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trendData}>
                  <defs>
                    <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160 60% 45%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(160 60% 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(222 47% 8%)",
                      border: "1px solid hsl(217 33% 17%)",
                      borderRadius: "8px",
                      color: "hsl(210 40% 98%)",
                    }}
                  />
                  <Area type="monotone" dataKey="opened" stroke="hsl(0 84% 60%)" strokeWidth={2} fillOpacity={1} fill="url(#colorOpened)" name="Bugs Opened" />
                  <Area type="monotone" dataKey="closed" stroke="hsl(160 60% 45%)" strokeWidth={2} fillOpacity={1} fill="url(#colorClosed)" name="Bugs Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card className="glass border-border/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <Monitor className="w-4 h-4 text-primary" />
              {t('reports.platformDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {platformChartData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                No platform data logged
              </div>
            ) : (
              <>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {platformChartData.map((entry, index) => (
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
                <div className="space-y-1.5 mt-2 max-h-[100px] overflow-y-auto scrollbar-thin px-2">
                  {platformChartData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-muted-foreground truncate">{entry.name}</span>
                      <span className="font-semibold ml-auto">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Bugs per Project and Leaders boards */}
      <div className="grid gap-6 md:grid-cols-6">
        {/* Bugs per Project */}
        <Card className="glass border-border/50 md:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <Bug className="w-4 h-4 text-primary" />
              {t('reports.bugsPerProject')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.bugsPerProject} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis type="number" tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "hsl(215 20% 65%)", fontSize: 12 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(222 47% 8%)",
                      border: "1px solid hsl(217 33% 17%)",
                      borderRadius: "8px",
                      color: "hsl(210 40% 98%)",
                    }}
                    cursor={{ fill: "rgba(255, 255, 255, 0.02)" }}
                  />
                  <Bar dataKey="count" fill="hsl(217 91% 60%)" radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Contributors Leaderboard */}
        <Card className="glass border-border/50 md:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              {t('reports.topContributors')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Top Reporters */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('reports.topReporters')}</h4>
              <div className="space-y-2">
                {data.topReporters.map((reporter) => (
                  <div key={reporter.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={reporter.name} image={reporter.avatar} size="sm" />
                      <span className="font-semibold">{reporter.name}</span>
                    </div>
                    <span className="text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded border border-border">
                      {reporter.count} Bugs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Developers */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Assigned Developers</h4>
              <div className="space-y-2">
                {data.topDevelopers.map((dev) => (
                  <div key={dev.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={dev.name} image={dev.avatar} size="sm" />
                      <span className="font-semibold">{dev.name}</span>
                    </div>
                    <span className="text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded border border-border">
                      {dev.count} Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
