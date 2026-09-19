import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isGuestEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: true, message: "No active session" });
    }

    const email = session.user.email;
    if (!isGuestEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Current user is not a temporary guest" },
        { status: 400 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    if (userId) {
      await prisma.user.delete({
        where: { id: userId },
      });
    }

    return NextResponse.json({ success: true, message: "Temporary guest data cleared" });
  } catch (error: unknown) {
    console.error("Guest cleanup error:", error);
    const message = error instanceof Error ? error.message : "Guest cleanup failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

