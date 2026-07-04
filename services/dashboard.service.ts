import { prisma } from "@/lib/prisma";
import { BugStatus, BugSeverity } from "@prisma/client";
import type { DashboardStats, BugStatusCount, SeverityCount, RecentActivity } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalBugs, openBugs, criticalBugs, fixedToday, totalProjects, totalUsers] =
    await Promise.all([
      prisma.bugReport.count(),
      prisma.bugReport.count({
        where: {
          status: {
            in: [
              BugStatus.NEW,
              BugStatus.OPEN,
              BugStatus.ASSIGNED,
              BugStatus.IN_PROGRESS,
            ],
          },
        },
      }),
      prisma.bugReport.count({
        where: { severity: BugSeverity.CRITICAL, status: { not: BugStatus.CLOSED } },
      }),
      prisma.bugReport.count({
        where: {
          status: BugStatus.FIXED,
          updatedAt: { gte: today },
        },
      }),
      prisma.project.count(),
      prisma.user.count(),
    ]);

  return { totalBugs, openBugs, criticalBugs, fixedToday, totalProjects, totalUsers };
}

export async function getBugStatusDistribution(): Promise<BugStatusCount[]> {
  const result = await prisma.bugReport.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return result.map((r) => ({
    status: r.status,
    count: r._count.status,
  }));
}

export async function getSeverityDistribution(): Promise<SeverityCount[]> {
  const result = await prisma.bugReport.groupBy({
    by: ["severity"],
    _count: { severity: true },
  });

  return result.map((r) => ({
    severity: r.severity,
    count: r._count.severity,
  }));
}

export async function getRecentActivity(limit = 10): Promise<RecentActivity[]> {
  const logs = await prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, avatar: true } },
      bug: { select: { bugCode: true, title: true } },
    },
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    bugCode: log.bug.bugCode,
    bugTitle: log.bug.title,
    userName: log.user.name,
    userAvatar: log.user.avatar ?? undefined,
    createdAt: log.createdAt.toISOString(),
  }));
}
