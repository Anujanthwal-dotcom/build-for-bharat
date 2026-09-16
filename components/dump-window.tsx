"use client";

import { useState, useRef, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import * as Slider from "@radix-ui/react-slider";
import { X, FileText, Link as LinkIcon, Upload, Trash2, ArrowRight } from "lucide-react";
import { useUIStore } from "@/lib/store/ui-store";
import { useRouter } from "next/navigation";

export default function DumpWindowModal() {
  const { isDumpWindowOpen, closeDumpWindow } = useUIStore();
  const router = useRouter();
  
  const [text, setText] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [files, setFiles] = useState<File[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState("Build Mind Map");
  const [depth, setDepth] = useState([50]); // 0 = Summary, 50 = Standard, 100 = Deep Dive

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/account/preferences");
        if (!res.ok) return;
        const prefs = await res.json();
        if (prefs.defaultDepth === "summary") setDepth([0]);
        else if (prefs.defaultDepth === "deep") setDepth([100]);
        else setDepth([50]);
      } catch {
        // keep default
      }
    })();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusText("Ingesting sources...");
    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("links", JSON.stringify(links.filter(l => l.trim() !== "")));
      files.forEach(file => formData.append("files", file));

      // 1. Ingest
      const createRes = await fetch('/api/projects/create', {
        method: 'POST',
        body: formData,
      });
      const createData = await createRes.json();

      if (!createData.success) throw new Error(createData.error || "Failed to create project");
      
      const projectId = createData.projectId;

      setStatusText("Extracting knowledge graph...");

      // 2. Generate Graph
      const depthValue: "summary" | "standard" | "deep" = depth[0] < 33 ? "summary" : depth[0] > 66 ? "deep" : "standard";
      const genRes = await fetch(`/api/projects/${projectId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depth: depthValue }),
      });
      const genData = await genRes.json();
      
      if (!genData.success) throw new Error(genData.error || "Failed to generate graph");

      setStatusText("Complete!");
      closeDumpWindow();
      router.push(`/project/${projectId}`);
      
    } catch (error: unknown) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to create mindmap");
    } finally {
      setIsGenerating(false);
      setStatusText("Build Mind Map");
    }
  };

  const addLink = () => setLinks([...links, ""]);
  const updateLink = (index: number, val: string) => {
    const newLinks = [...links];
    newLinks[index] = val;
    setLinks(newLinks);
  };
  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <Dialog.Root open={isDumpWindowOpen} onOpenChange={(open) => !open && closeDumpWindow()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl bg-[#121214] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.6)] rounded-lg z-50 overflow-hidden flex flex-col max-h-[85vh] data-[state=open]:animate-fade-in-up">
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <Dialog.Title className="text-lg font-semibold text-white/90">New Knowledge Extraction</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-muted hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <Tabs.Root defaultValue="text" className="flex flex-col flex-1 min-h-0">
            <div className="px-6 pt-4">
              <Tabs.List className="flex border-b border-white/10 gap-6">
                <Tabs.Trigger value="text" className="pb-3 text-sm font-medium text-muted hover:text-white/80 data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Text / Notes
                </Tabs.Trigger>
                <Tabs.Trigger value="links" className="pb-3 text-sm font-medium text-muted hover:text-white/80 data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent transition-colors flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> URLs
                </Tabs.Trigger>
                <Tabs.Trigger value="files" className="pb-3 text-sm font-medium text-muted hover:text-white/80 data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent transition-colors flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Files (PDF/MD)
                </Tabs.Trigger>
              </Tabs.List>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-black/20">
              <Tabs.Content value="text" className="h-full outline-none">
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-full min-h-[200px] bg-black/40 border border-white/10 rounded-lg p-4 text-sm text-white/90 font-mono placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 resize-none transition-all scrollbar-thin"
                  placeholder="Paste your raw documentation, unorganized thoughts, or meeting transcripts here..."
                />
              </Tabs.Content>

              <Tabs.Content value="links" className="h-full outline-none space-y-3">
                {links.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      type="url"
                      value={link}
                      onChange={(e) => updateLink(i, e.target.value)}
                      placeholder="https://docs.example.com/..."
                      className="flex-1 bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50 transition-all"
                    />
                    {links.length > 1 && (
                      <button onClick={() => removeLink(i)} className="p-2 text-muted hover:text-red-400 bg-white/5 rounded-md hover:bg-white/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  onClick={addLink}
                  className="text-xs font-mono text-accent hover:text-accent/80 transition-colors mt-2"
                >
                  + Add another URL
                </button>
              </Tabs.Content>

              <Tabs.Content value="files" className="h-full outline-none flex flex-col">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple 
                  accept=".pdf,.txt,.md" 
                  className="hidden" 
                />
                
                {files.length === 0 ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-h-[200px] border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors border-accent/20 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-accent/70" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white/90">Click to browse files</p>
                      <p className="text-xs text-muted mt-1 font-mono">Supports .pdf, .txt, .md</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-white/90">Selected Files</h4>
                      <button onClick={() => fileInputRef.current?.click()} className="text-xs text-accent">Add more</button>
                    </div>
                    <div className="space-y-2">
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-md">
                          <span className="text-sm text-white/90 font-mono truncate">{file.name}</span>
                          <button onClick={() => removeFile(i)} className="text-muted hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Tabs.Content>
            </div>
          </Tabs.Root>

          <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex-1 max-w-[200px]">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Depth</span>
                <span className="text-[10px] font-mono text-accent uppercase tracking-wider">
                  {depth[0] < 33 ? 'Summary' : depth[0] > 66 ? 'Deep Dive' : 'Standard'}
                </span>
              </div>
              <Slider.Root 
                className="relative flex items-center select-none touch-none w-full h-4" 
                value={depth} 
                onValueChange={setDepth}
                max={100} 
                step={1}
              >
                <Slider.Track className="bg-white/10 relative grow rounded-full h-1">
                  <Slider.Range className="absolute bg-accent rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-3 h-3 bg-accent rounded-full focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-grab active:cursor-grabbing shadow-[0_0_10px_rgba(226,224,217,0.5)]" />
              </Slider.Root>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || (!text && links.filter(l=>l.trim()!=='').length === 0 && files.length === 0)}
              className="flex items-center gap-2 bg-accent text-black font-medium px-5 py-2 rounded-md hover:bg-accent/90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(226,224,217,0.3)] relative overflow-hidden min-w-[160px] justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span className="truncate">{statusText}</span>
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                </>
              ) : (
                <>
                  Build Mind Map
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
