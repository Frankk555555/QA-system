import { NextRequest, NextResponse } from "next/server";
import { getBugs, createBug } from "@/services/bug.service";
import { auth } from "@/auth";
import type { BugFilters } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: BugFilters = {
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 10,
      status: searchParams.get("status") as BugFilters["status"],
      severity: searchParams.get("severity") as BugFilters["severity"],
      priority: searchParams.get("priority") as BugFilters["priority"],
      projectId: searchParams.get("projectId") || undefined,
      assignedToId: searchParams.get("assignedToId") || undefined,
      reporterId: searchParams.get("reporterId") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || undefined,
    };

    const session = await auth();
    const user = session?.user ? { id: session.user.id, role: session.user.role as string } : undefined;

    const result = await getBugs(filters, user);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Get bugs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bugs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const bug = await createBug({
      ...body,
      reporterId: session.user.id,
    });

    return NextResponse.json({ success: true, data: bug }, { status: 201 });
  } catch (error) {
    console.error("Create bug error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create bug" },
      { status: 500 }
    );
  }
}
