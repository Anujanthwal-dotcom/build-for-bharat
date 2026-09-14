import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as cheerio from 'cheerio';
const pdf = require('pdf-parse');

// Helper to get or create a dummy user for the demo
async function getDummyUser() {
  let user = await prisma.user.findFirst({ where: { email: 'demo@mindflow.app' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Demo User',
        email: 'demo@mindflow.app',
      }
    });
  }
  return user;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const linksRaw = formData.get('links') as string;
    const links = linksRaw ? JSON.parse(linksRaw) : [];
    const files = formData.getAll('files') as File[];

    const user = await getDummyUser();
    
    // Create Project
    const project = await prisma.project.create({
      data: {
        name: 'New Masterclass',
        userId: user.id,
      }
    });

    const sources = [];

    // Process Text
    if (text && text.trim()) {
      sources.push({
        type: 'text',
        content: text.trim(),
        label: 'Raw Notes',
        projectId: project.id,
      });
    }

    // Process Links
    for (const link of links) {
      if (!link) continue;
      try {
        const res = await fetch(link);
        const html = await res.text();
        const $ = cheerio.load(html);
        // Remove scripts and styles
        $('script, style').remove();
        const content = $('body').text().replace(/\s+/g, ' ').trim();
        sources.push({
          type: 'link',
          content: content.substring(0, 10000), // limit size
          label: link,
          projectId: project.id,
        });
      } catch (e) {
        console.error("Failed to fetch link", link, e);
      }
    }

    // Process Files
    for (const file of files) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        if (file.name.endsWith('.pdf')) {
          const data = await pdf(buffer);
          sources.push({
            type: 'pdf',
            content: data.text.substring(0, 20000), // limit size
            label: file.name,
            projectId: project.id,
          });
        } else {
          // txt, md
          sources.push({
            type: 'file',
            content: buffer.toString('utf-8').substring(0, 20000),
            label: file.name,
            projectId: project.id,
          });
        }
      } catch (e) {
        console.error("Failed to parse file", file.name, e);
      }
    }

    // Save sources
    if (sources.length > 0) {
      await prisma.source.createMany({ data: sources });
    }

    return NextResponse.json({ 
      success: true, 
      projectId: project.id,
      message: "Sources parsed successfully." 
    });
  } catch (error: any) {
    console.error("Ingestion error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
