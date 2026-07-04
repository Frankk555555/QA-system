import { NextRequest, NextResponse } from "next/server";
import { getBugById, updateBugStatus } from "@/services/bug.service";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bug = await getBugById(id);

    if (!bug) {
      return NextResponse.json(
        { success: false, error: "Bug not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: bug });
  } catch (error) {
    console.error("Get bug error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bug" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (body.status) {
      const updated = await updateBugStatus(id, body.status, session.user.id);
      return NextResponse.json({ success: true, data: updated });
    }

    const updated = await prisma.bugReport.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update bug error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update bug" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.bugReport.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Bug deleted" });
  } catch (error) {
    console.error("Delete bug error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete bug" },
      { status: 500 }
    );
  }
}
