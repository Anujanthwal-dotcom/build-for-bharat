if (
  process.env.NODE_ENV === "production" ||
  !process.env.NEXTAUTH_URL ||
  process.env.NEXTAUTH_URL.includes("localhost")
) {
  process.env.NEXTAUTH_URL = "https://main.d3ds9gzbu94egf.amplifyapp.com";
}

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";

const authHandler = NextAuth(authOptions);

async function handler(req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host && (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("localhost"))) {
    process.env.NEXTAUTH_URL = `${proto}://${host}`;
  }
  return authHandler(req, ctx);
}

export { handler as GET, handler as POST };