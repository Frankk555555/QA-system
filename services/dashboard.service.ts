import { prisma } from "@/lib/prisma";
import { BugStatus, BugSeverity } from "@prisma/client";
import type { DashboardStats, BugStatusCount, SeverityCount, RecentActivity } from "@/types";
import { getRoleBasedBugFilter, type RbacUser } from "@/lib/rbac";

export async function getDashboardStats(user?: RbacUser): Promise<DashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const baseWhere = user ? getRoleBasedBugFilter(user) : {};

  const [totalBugs, openBugs, criticalBugs, fixedToday, totalProjects, totalUsers] =
    await Promise.all([
      prisma.bugReport.count({ where: baseWhere }),
      prisma.bugReport.count({
        where: {
          ...baseWhere,
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
        where: { ...baseWhere, severity: BugSeverity.CRITICAL, status: { not: BugStatus.CLOSED } },
      }),
      prisma.bugReport.count({
        where: {
          ...baseWhere,
          status: BugStatus.FIXED,
          updatedAt: { gte: today },
        },
      }),
      prisma.project.count(),
      prisma.user.count(),
    ]);

  return { totalBugs, openBugs, criticalBugs, fixedToday, totalProjects, totalUsers };
}

export async function getBugStatusDistribution(user?: RbacUser): Promise<BugStatusCount[]> {
  const where = user ? getRoleBasedBugFilter(user) : {};
  const result = await prisma.bugReport.groupBy({
    by: ["status"],
    where,
    _count: { status: true },
  });

  return result.map((r) => ({
    status: r.status,
    count: r._count.status,
  }));
}

export async function getSeverityDistribution(user?: RbacUser): Promise<SeverityCount[]> {
  const where = user ? getRoleBasedBugFilter(user) : {};
  const result = await prisma.bugReport.groupBy({
    by: ["severity"],
    where,
    _count: { severity: true },
  });

  return result.map((r) => ({
    severity: r.severity,
    count: r._count.severity,
  }));
}

export async function getRecentActivity(limit = 10, user?: RbacUser): Promise<RecentActivity[]> {
  const bugWhere = user ? getRoleBasedBugFilter(user) : {};
  const logs = await prisma.activityLog.findMany({
    take: limit,
    where: {
      bug: bugWhere,
    },
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
