import { NextResponse } from "next/server";
import {
  getDashboardStats,
  getBugStatusDistribution,
  getSeverityDistribution,
  getRecentActivity,
} from "@/services/dashboard.service";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user ? { id: session.user.id, role: session.user.role as string } : undefined;

    const [stats, statusDistribution, severityDistribution, recentActivity] =
      await Promise.all([
        getDashboardStats(user),
        getBugStatusDistribution(user),
        getSeverityDistribution(user),
        getRecentActivity(10, user),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        statusDistribution,
        severityDistribution,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
