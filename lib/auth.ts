import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const authSecret = process.env.AUTH_SECRET?.trim() || "development-auth-secret-change-me";

export function isGuestEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.endsWith("@temp.mindflow.local");
}

export async function cleanupExpiredGuestUsers(maxAgeMs = 2 * 60 * 60 * 1000): Promise<void> {
  try {
    const guests = await prisma.user.findMany({
      where: {
        email: {
          endsWith: "@temp.mindflow.local",
        },
      },
      select: { id: true, email: true },
    });

    const now = Date.now();
    const toDeleteIds: string[] = [];

    for (const guest of guests) {
      if (!guest.email) continue;
      const match = guest.email.match(/^guest_(\d+)_/);
      if (match) {
        const timestamp = parseInt(match[1], 10);
        if (now - timestamp > maxAgeMs) {
          toDeleteIds.push(guest.id);
        }
      }
    }

    if (toDeleteIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: toDeleteIds } },
      });
    }
  } catch (error) {
    console.error("Failed to cleanup expired guest users:", error);
  }
}

async function seedGuestStarterProject(userId: string) {
  await prisma.project.create({
    data: {
      name: "MindFlow Demo Architecture",
      description: "Interactive sample mindmap showcasing MindFlow's core concepts",
      userId,
      sources: {
        create: [
          {
            type: "text",
            label: "MindFlow Quick Tour",
            content: "MindFlow is an intelligent knowledge visualization engine that ingests documents, notes, and URLs, extracting concepts into aesthetic mental models.",
          },
        ],
      },
      nodes: {
        create: [
          {
            nodeId: "root-1",
            label: "MindFlow Engine",
            summary: "Central hub for transforming raw documents into structured interactive knowledge graphs.",
            category: "Core Concept",
            tags: ["architecture", "core"],
            x: 220,
            y: 160,
          },
          {
            nodeId: "ai-pipe",
            label: "AI Extraction Pipeline",
            summary: "Utilizes Google Gemini with structured output parsing to identify concepts, hierarchies, and relations.",
            category: "Intelligence",
            tags: ["ai", "gemini", "langchain"],
            x: 580,
            y: 60,
          },
          {
            nodeId: "layout-eng",
            label: "Topological Layout",
            summary: "Dagre-directed hierarchical graph arrangement with automated node clearance and collision prevention.",
            category: "Visualization",
            tags: ["dagre", "xyflow", "layout"],
            x: 580,
            y: 260,
          },
          {
            nodeId: "sources-ingest",
            label: "Multi-Source Ingestion",
            summary: "Parses web articles, PDF documents, and freeform text into standardized contextual chunks.",
            category: "Data Ingestion",
            tags: ["pdf", "cheerio", "parser"],
            x: 940,
            y: 60,
          },
          {
            nodeId: "export-eng",
            label: "Interactive Canvas & Export",
            summary: "XYFlow canvas supporting fluid zooming, node re-positioning, and PNG/SVG/JSON exports.",
            category: "Output",
            tags: ["canvas", "export", "ui"],
            x: 940,
            y: 260,
          },
        ],
      },
      edges: {
        create: [
          {
            edgeId: "e1",
            source: "root-1",
            target: "ai-pipe",
            label: "analyzes with",
          },
          {
            edgeId: "e2",
            source: "root-1",
            target: "layout-eng",
            label: "structures using",
          },
          {
            edgeId: "e3",
            source: "ai-pipe",
            target: "sources-ingest",
            label: "ingests data from",
          },
          {
            edgeId: "e4",
            source: "layout-eng",
            target: "export-eng",
            label: "renders to",
          },
        ],
      },
    },
  });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    CredentialsProvider({
      id: "guest",
      name: "Guest",
      credentials: {},
      async authorize() {
        // Run background sweep of stale guest accounts
        cleanupExpiredGuestUsers().catch(() => {});

        const now = Date.now();
        const randomSuffix = crypto.randomBytes(3).toString("hex");
        const guestNumber = Math.floor(1000 + Math.random() * 9000);
        const guestEmail = `guest_${now}_${randomSuffix}@temp.mindflow.local`;
        const guestName = `Guest #${guestNumber}`;

        const guest = await prisma.user.create({
          data: {
            name: guestName,
            email: guestEmail,
            image: null,
          },
        });

        // Seed a sample starter mindmap for an immediate impressive demo experience
        try {
          await seedGuestStarterProject(guest.id);
        } catch (err) {
          console.error("Failed to seed guest starter project:", err);
        }

        return {
          id: guest.id,
          name: guest.name,
          email: guest.email,
          image: guest.image,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: authSecret,
  pages: { signIn: "/" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && (token.id || token.sub)) {
        (session.user as { id: string }).id = (token.id || token.sub) as string;
      }
      return session;
    },
  },
};

export async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as { id?: string }).id ?? null;
}