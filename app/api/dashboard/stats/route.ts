import { NextResponse } from "next/server";
import {
  getDashboardStats,
  getBugStatusDistribution,
  getSeverityDistribution,
  getRecentActivity,
} from "@/services/dashboard.service";

export async function GET() {
  try {
    const [stats, statusDistribution, severityDistribution, recentActivity] =
      await Promise.all([
        getDashboardStats(),
        getBugStatusDistribution(),
        getSeverityDistribution(),
        getRecentActivity(),
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
