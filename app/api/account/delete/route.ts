import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    // Delete user — cascades to accounts, sessions, projects, sources, nodes, edges
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Account deletion error:", error);
    const message = error instanceof Error ? error.message : "Account deletion failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
