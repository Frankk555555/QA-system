"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { BugStatusChart } from "@/components/dashboard/BugStatusChart";
import { SeverityChart } from "@/components/dashboard/SeverityChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Loader2 } from "lucide-react";
import type { DashboardStats, BugStatusCount, SeverityCount, RecentActivity as RecentActivityType } from "@/types";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    stats: DashboardStats;
    statusDistribution: BugStatusCount[];
    severityDistribution: SeverityCount[];
    recentActivity: RecentActivityType[];
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard/stats");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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
        <h2 className="text-xl font-bold">Failed to load dashboard statistics.</h2>
        <p className="text-muted-foreground mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <PageHeader
        title="Dashboard"
        description="Overview of game QA statistics, active bug reports, and project health."
      />

      <StatsCards stats={data.stats} />

      <div className="grid gap-6 md:grid-cols-6">
        <div className="md:col-span-3">
          <BugStatusChart data={data.statusDistribution} />
        </div>
        <div className="md:col-span-3">
          <SeverityChart data={data.severityDistribution} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-6">
        <div className="md:col-span-6">
          <RecentActivity activities={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}
