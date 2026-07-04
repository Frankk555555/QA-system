import { NextRequest, NextResponse } from "next/server";
import { createBuild } from "@/services/project.service";
import { auth } from "@/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    // Admin, Producer, QA Tester can submit builds
    const userRole = (session?.user as { role?: string })?.role;
    if (!session || (userRole !== "ADMIN" && userRole !== "PRODUCER" && userRole !== "QA_TESTER")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (!body.version || !body.platform) {
      return NextResponse.json(
        { success: false, error: "Version and platform are required" },
        { status: 400 }
      );
    }

    const build = await createBuild({
      projectId: id,
      version: body.version,
      platform: body.platform,
      releaseDate: body.releaseDate,
    });

    return NextResponse.json({ success: true, data: build }, { status: 201 });
  } catch (error) {
    console.error("Create build error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create build" },
      { status: 500 }
    );
  }
}
