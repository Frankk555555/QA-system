import { NextResponse } from "next/server";
import { getDevelopers } from "@/services/user.service";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const developers = await getDevelopers();
    return NextResponse.json({ success: true, data: developers });
  } catch (error) {
    console.error("Get developers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch developers" },
      { status: 500 }
    );
  }
}
