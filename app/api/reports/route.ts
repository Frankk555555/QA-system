import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BugStatus, BugSeverity, Platform } from "@prisma/client";
import { auth } from "@/auth";
import { getRoleBasedBugFilter } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user ? { id: session.user.id, role: session.user.role as string } : undefined;
    const baseWhere = user ? getRoleBasedBugFilter(user) : {};

    // 1. Average resolution time
    // Let's get bugs with status FIXED/VERIFIED/CLOSED and check difference between createdAt and updatedAt
    const resolvedBugs = await prisma.bugReport.findMany({
      where: {
        ...baseWhere,
        status: { in: [BugStatus.FIXED, BugStatus.VERIFIED, BugStatus.CLOSED] },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    let avgResolutionTimeHours = 0;
    if (resolvedBugs.length > 0) {
      const totalDiffMs = resolvedBugs.reduce((acc, bug) => {
        return acc + (bug.updatedAt.getTime() - bug.createdAt.getTime());
      }, 0);
      avgResolutionTimeHours = Math.round(totalDiffMs / (1000 * 60 * 60 * resolvedBugs.length));
    }

    // 2. Bugs per project
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { bugs: { where: baseWhere } },
        },
      },
    });
    const bugsPerProject = projects.map((p) => ({
      name: p.name,
      count: p._count.bugs,
    }));

    // 3. Top Reporters
    const reporters = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        _count: {
          select: { reportedBugs: { where: baseWhere } },
        },
      },
      orderBy: { reportedBugs: { _count: "desc" } },
      take: 5,
    });
    const topReporters = reporters.map((r) => ({
      name: r.name,
      avatar: r.avatar,
      count: r._count.reportedBugs,
    }));

    // 4. Top Developers (fixers)
    const developers = await prisma.user.findMany({
      where: { role: "DEVELOPER" },
      select: {
        id: true,
        name: true,
        avatar: true,
        _count: {
          select: { assignedBugs: { where: baseWhere } },
        },
      },
      orderBy: { assignedBugs: { _count: "desc" } },
      take: 5,
    });
    const topDevelopers = developers.map((d) => ({
      name: d.name,
      avatar: d.avatar,
      count: d._count.assignedBugs, // Assigned or fixed in real scenario
    }));

    // 5. Severity distribution
    const severityGroups = await prisma.bugReport.groupBy({
      by: ["severity"],
      where: baseWhere,
      _count: { severity: true },
    });
    const severityData = severityGroups.map((g) => ({
      severity: g.severity,
      count: g._count.severity,
    }));

    // 6. Platform distribution
    const buildsWithBugs = await prisma.bugReport.findMany({
      where: { ...baseWhere, buildId: { not: null } },
      select: {
        build: {
          select: { platform: true },
        },
      },
    });
    const platformCounts: Record<string, number> = {};
    Object.values(Platform).forEach((p) => {
      platformCounts[p] = 0;
    });
    buildsWithBugs.forEach((b) => {
      if (b.build?.platform) {
        platformCounts[b.build.platform] = (platformCounts[b.build.platform] || 0) + 1;
      }
    });
    const platformData = Object.entries(platformCounts).map(([platform, count]) => ({
      platform,
      count,
    }));

    // 7. Monthly/Weekly Trends (Mocked slightly from seed, but calculated from actual data)
    // We group bugs by creation date (last 7 days or last 30 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const trendBugs = await prisma.bugReport.findMany({
      where: { ...baseWhere, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, status: true },
    });

    const trendMap: Record<string, { opened: number; closed: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      trendMap[dateStr] = { opened: 0, closed: 0 };
    }

    trendBugs.forEach((bug) => {
      const dateStr = bug.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (trendMap[dateStr]) {
        trendMap[dateStr].opened += 1;
        if (bug.status === BugStatus.FIXED || bug.status === BugStatus.VERIFIED || bug.status === BugStatus.CLOSED) {
          trendMap[dateStr].closed += 1;
        }
      }
    });

    const trendData = Object.entries(trendMap).map(([date, counts]) => ({
      date,
      opened: counts.opened,
      closed: counts.closed,
    }));

    return NextResponse.json({
      success: true,
      data: {
        avgResolutionTimeHours,
        bugsPerProject,
        topReporters,
        topDevelopers,
        severityData,
        platformData,
        trendData,
      },
    });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate reports data" },
      { status: 500 }
    );
  }
}
