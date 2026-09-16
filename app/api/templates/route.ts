import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import z from 'zod';
import type { CustomTemplateRecord } from '@/lib/constants';

const CreateSchema = z.object({
  name: z.string().min(1).max(80),
  emoji: z.string().min(1).max(8).default("📝"),
  description: z.string().min(1).max(300),
  tags: z.array(z.string()).max(10).default([]),
  systemInstructions: z.string().min(1).max(2000),
  defaultDepth: z.enum(["summary", "standard", "deep"]).default("standard"),
  suggestedInput: z.enum(["url", "text", "file", "any"]).default("any"),
});

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const templates = await prisma.customTemplate.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    const records: CustomTemplateRecord[] = templates.map((t) => ({
      id: t.id,
      name: t.name,
      emoji: t.emoji,
      description: t.description,
      tags: JSON.parse(t.tags || "[]"),
      systemInstructions: t.systemInstructions,
      defaultDepth: t.defaultDepth as CustomTemplateRecord["defaultDepth"],
      suggestedInput: t.suggestedInput as CustomTemplateRecord["suggestedInput"],
    }));

    return NextResponse.json({ success: true, templates: records });
  } catch (error: unknown) {
    console.error("List templates error:", error);
    const message = error instanceof Error ? error.message : "Failed to list templates";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const created = await prisma.customTemplate.create({
      data: {
        name: data.name,
        emoji: data.emoji,
        description: data.description,
        tags: JSON.stringify(data.tags),
        systemInstructions: data.systemInstructions,
        defaultDepth: data.defaultDepth,
        suggestedInput: data.suggestedInput,
        userId,
      },
    });

    const record: CustomTemplateRecord = {
      id: created.id,
      name: created.name,
      emoji: created.emoji,
      description: created.description,
      tags: JSON.parse(created.tags || "[]"),
      systemInstructions: created.systemInstructions,
      defaultDepth: created.defaultDepth as CustomTemplateRecord["defaultDepth"],
      suggestedInput: created.suggestedInput as CustomTemplateRecord["suggestedInput"],
    };

    return NextResponse.json({ success: true, template: record });
  } catch (error: unknown) {
    console.error("Create template error:", error);
    const message = error instanceof Error ? error.message : "Failed to create template";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}