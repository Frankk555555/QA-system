import { NextRequest, NextResponse } from "next/server";
import { getUsers, createUser } from "@/services/user.service";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const users = await getUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin only." },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await createUser(body);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
