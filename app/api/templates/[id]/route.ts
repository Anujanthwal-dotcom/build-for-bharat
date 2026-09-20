import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.customTemplate.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    await prisma.customTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Delete template error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete template";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}