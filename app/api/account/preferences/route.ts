import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

const VALID_THEMES = ["dark", "system"];
const VALID_DEPTHS = ["summary", "standard", "deep"];

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prefs = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  return NextResponse.json({
    theme: prefs?.theme ?? "dark",
    defaultDepth: prefs?.defaultDepth ?? "standard",
  });
}

export async function PUT(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data: Record<string, string> = {};

  if ("theme" in body) {
    if (!VALID_THEMES.includes(body.theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }
    data.theme = body.theme;
  }

  if ("defaultDepth" in body) {
    if (!VALID_DEPTHS.includes(body.defaultDepth)) {
      return NextResponse.json({ error: "Invalid defaultDepth" }, { status: 400 });
    }
    data.defaultDepth = body.defaultDepth;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const prefs = await prisma.userPreferences.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  return NextResponse.json({
    theme: prefs.theme,
    defaultDepth: prefs.defaultDepth,
  });
}