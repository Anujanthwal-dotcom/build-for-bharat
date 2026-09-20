import { NextResponse } from 'next/server';
import { fetchGroundedNodeDeepDive } from '@/lib/ai';
import { z } from 'zod';

const DeepDiveSchema = z.object({
  label: z.string().min(1).max(200),
  summary: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  projectTitle: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = DeepDiveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const result = await fetchGroundedNodeDeepDive(parsed.data);
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch concept deep dive";
    console.error("Deep dive route error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

