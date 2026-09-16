import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import * as cheerio from 'cheerio';
import { PDFParse } from 'pdf-parse';

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const text = formData.get('text') as string;
    const linksRaw = formData.get('links') as string;
    const links = linksRaw ? JSON.parse(linksRaw) : [];
    const files = formData.getAll('files') as File[];

    // Create Project
    const project = await prisma.project.create({
      data: {
        name: 'New Mindmap',
        userId,
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
          const parser = new PDFParse({ data: buffer });
          const textResult = await parser.getText();
          sources.push({
            type: 'file',
            content: textResult.text.substring(0, 20000), // limit size
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
  } catch (error: unknown) {
    console.error("Ingestion error:", error);
    const message = error instanceof Error ? error.message : "Ingestion failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
