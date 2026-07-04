import { NextRequest, NextResponse } from "next/server";
import { getProjects, createProject } from "@/services/project.service";
import { auth } from "@/auth";

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string }).role !== "ADMIN" && (session.user as { role?: string }).role !== "PRODUCER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin or Producer only." },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Project name is required" },
        { status: 400 }
      );
    }

    const project = await createProject(body);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}
