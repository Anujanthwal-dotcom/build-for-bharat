"use client";

import { useState } from "react";
import { FileImage, FileText, FileType2, Loader2 } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExportMenuProps {
  projectId: string;
}

export function ExportMenu({ projectId }: ExportMenuProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const downloadFromApi = async (format: "svg" | "markdown") => {
    setExporting(format);
    try {
      const response = await fetch(`/api/projects/${projectId}/export?format=${format}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = format === "svg" ? "mindmap.svg" : "mindmap.md";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  const exportPng = async () => {
    setExporting("png");
    try {
      const response = await fetch(`/api/projects/${projectId}/export?format=svg`);
      const svgText = await response.text();
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        if (context) {
          context.drawImage(image, 0, 0);
          const pngUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = "mindmap.png";
          link.click();
        }
        URL.revokeObjectURL(url);
        setExporting(null);
      };
      image.onerror = () => setExporting(null);
      image.src = url;
    } catch {
      setExporting(null);
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-center gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <GlassButton variant="secondary" size="sm" onClick={() => downloadFromApi("svg")} disabled={!!exporting}>
              {exporting === "svg" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileType2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">SVG</span>
            </GlassButton>
          </TooltipTrigger>
          <TooltipContent>Export as SVG</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <GlassButton variant="secondary" size="sm" onClick={exportPng} disabled={!!exporting}>
              {exporting === "png" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileImage className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">PNG</span>
            </GlassButton>
          </TooltipTrigger>
          <TooltipContent>Export as PNG</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <GlassButton variant="secondary" size="sm" onClick={() => downloadFromApi("markdown")} disabled={!!exporting}>
              {exporting === "markdown" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Markdown</span>
            </GlassButton>
          </TooltipTrigger>
          <TooltipContent>Export as Markdown hierarchy</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}