"use client";

import { useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import * as Slider from "@radix-ui/react-slider";
import { X, FileText, Link as LinkIcon, Upload, Trash2, ArrowRight, Sparkles, GitBranch, Star, FolderTree, AlertCircle, Check, Loader2 } from "lucide-react";
import { useUIStore } from "@/lib/store/ui-store";
import { useRouter } from "next/navigation";
import { TEMPLATE_CATEGORY_LABELS, type TemplateDef } from "@/lib/constants";

const depthToSlider = (depth: TemplateDef["defaultDepth"]): number =>
  depth === "summary" ? 0 : depth === "deep" ? 100 : 50;

const suggestedToTab = (suggested: TemplateDef["suggestedInput"]): string =>
  suggested === "url" ? "links" : suggested === "file" ? "files" : "text";

interface GitHubMeta {
  owner: string;
  repo: string;
  branch: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  totalFiles: number;
  totalDirs: number;
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function GitHubInput({
  onRepoFetched,
  isGenerating,
}: {
  onRepoFetched: (content: string, meta: GitHubMeta) => void;
  isGenerating: boolean;
}) {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedMeta, setFetchedMeta] = useState<GitHubMeta | null>(null);
  const [isFetched, setIsFetched] = useState(false);

  const isValidUrl = (url: string): boolean => {
    const trimmed = url.trim();
    if (!trimmed) return false;
    // Full URL
    if (/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/.test(trimmed)) return true;
    // Shorthand owner/repo
    if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) return true;
    return false;
  };

  const handleFetch = async () => {
    if (!isValidUrl(repoUrl)) {
      setError("Enter a valid GitHub URL (e.g. https://github.com/owner/repo) or owner/repo");
      return;
    }
    setIsFetching(true);
    setError(null);
    setFetchedMeta(null);
    setIsFetched(false);

    try {
      const res = await fetch("/api/github/repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          branch: branch.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch repository");
      }
      setFetchedMeta(data.meta);
      setIsFetched(true);
      onRepoFetched(data.content, data.meta);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch repository");
    } finally {
      setIsFetching(false);
    }
  };

  const handleUrlChange = (val: string) => {
    setRepoUrl(val);
    setIsFetched(false);
    setFetchedMeta(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* GitHub URL Input */}
      <div>
        <label className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5 block">
          Repository URL
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <GitHubIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://github.com/owner/repo  or  owner/repo"
              className="w-full bg-black/40 border border-white/10 rounded-md pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-mono"
              disabled={isFetching || isGenerating}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isFetching && !isFetched) handleFetch();
              }}
            />
          </div>
          {!isFetched && (
            <button
              onClick={handleFetch}
              disabled={isFetching || !repoUrl.trim() || isGenerating}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-4 py-2 rounded-md transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed border border-white/10"
            >
              {isFetching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <FolderTree className="w-4 h-4" />
                  Fetch Repo
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Branch (optional) */}
      <div>
        <label className="text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5 block">
          Branch <span className="text-white/20">(optional, defaults to main)</span>
        </label>
        <div className="relative w-48">
          <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            value={branch}
            onChange={(e) => { setBranch(e.target.value); setIsFetched(false); setFetchedMeta(null); }}
            placeholder="main"
            className="w-full bg-black/40 border border-white/10 rounded-md pl-9 pr-3 py-2 text-sm text-white placeholder:text-muted/30 focus:outline-none focus:border-accent/50 transition-all font-mono"
            disabled={isFetching || isGenerating}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success — Repo Preview Card */}
      {fetchedMeta && isFetched && (
        <div className="bg-white/[0.03] border border-accent/20 rounded-lg p-4 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
              <GitHubIcon className="w-4 h-4 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white/90 truncate">
                {fetchedMeta.owner}/{fetchedMeta.repo}
              </h4>
              {fetchedMeta.description && (
                <p className="text-[11px] text-muted truncate">{fetchedMeta.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-[10px] font-mono">
              <Check className="w-3 h-3" />
              Fetched
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {fetchedMeta.language && (
              <span className="text-[10px] font-mono text-accent/80 bg-accent/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent/60" />
                {fetchedMeta.language}
              </span>
            )}
            <span className="text-[10px] font-mono text-white/50 bg-white/5 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Star className="w-2.5 h-2.5" />
              {fetchedMeta.stars.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-white/50 bg-white/5 px-1.5 py-0.5 rounded flex items-center gap-1">
              <GitBranch className="w-2.5 h-2.5" />
              {fetchedMeta.branch}
            </span>
            <span className="text-[10px] font-mono text-white/50 bg-white/5 px-1.5 py-0.5 rounded">
              {fetchedMeta.totalFiles} files
            </span>
            <span className="text-[10px] font-mono text-white/50 bg-white/5 px-1.5 py-0.5 rounded">
              {fetchedMeta.totalDirs} dirs
            </span>
          </div>

          <p className="text-[10px] font-mono text-white/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Repo structure, README, and config files extracted — ready to generate mindmap
          </p>
        </div>
      )}

      {/* Empty state hint */}
      {!fetchedMeta && !error && !isFetching && (
        <div className="border border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center gap-3 bg-white/[0.01]">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
            <GitHubIcon className="w-6 h-6 text-white/20" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-white/50">Paste a GitHub repo URL to fetch its structure</p>
            <p className="text-[10px] text-white/25 font-mono">
              We&apos;ll pull the directory tree, README, and config files
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplateInputModal() {
  const { isTemplateInputOpen, selectedTemplate, closeTemplateInput } = useUIStore();
  const router = useRouter();

  const [text, setText] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [files, setFiles] = useState<File[]>([]);

  // GitHub-specific state
  const [githubContent, setGithubContent] = useState<string | null>(null);
  const [githubMeta, setGithubMeta] = useState<GitHubMeta | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState("Build Mind Map");
  const [depth, setDepth] = useState(() =>
    selectedTemplate ? [depthToSlider(selectedTemplate.defaultDepth)] : [50],
  );
  const [activeTab, setActiveTab] = useState(() =>
    selectedTemplate ? suggestedToTab(selectedTemplate.suggestedInput) : "text",
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGitHubMode = selectedTemplate?.suggestedInput === "github";



  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    setStatusText("Ingesting sources...");
    try {
      const formData = new FormData();

      if (isGitHubMode) {
        // For GitHub mode, send the fetched content as text
        if (!githubContent) return;
        formData.append("text", githubContent);
        formData.append("links", JSON.stringify([]));
      } else {
        formData.append("text", text);
        formData.append("links", JSON.stringify(links.filter(l => l.trim() !== "")));
        files.forEach(file => formData.append("files", file));
      }

      const createRes = await fetch('/api/projects/create', {
        method: 'POST',
        body: formData,
      });
      if (!createRes.ok) {
        const errText = await createRes.text();
        let errMsg = `Failed to create project (${createRes.status})`;
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error) errMsg = parsed.error;
        } catch {
          if (errText) errMsg = errText;
        }
        throw new Error(errMsg);
      }
      const createData = await createRes.json();

      if (!createData.success) throw new Error(createData.error || "Failed to create project");

      const projectId = createData.projectId;

      setStatusText("Extracting knowledge graph...");

      const depthValue: "summary" | "standard" | "deep" = depth[0] < 33 ? "summary" : depth[0] > 66 ? "deep" : "standard";
      const genRes = await fetch(`/api/projects/${projectId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depth: depthValue,
          systemInstructions: selectedTemplate.systemInstructions,
        }),
      });
      if (!genRes.ok) {
        const errText = await genRes.text();
        let errMsg = `Failed to generate graph (${genRes.status})`;
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error) errMsg = parsed.error;
        } catch {
          if (errText) errMsg = errText;
        }
        throw new Error(errMsg);
      }
      const genData = await genRes.json();

      if (!genData.success) throw new Error(genData.error || "Failed to generate graph");

      // If GitHub mode, rename project to repo name
      if (isGitHubMode && githubMeta) {
        await fetch(`/api/projects/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: `${githubMeta.owner}/${githubMeta.repo}` }),
        });
      }

      setStatusText("Complete!");
      closeTemplateInput();
      router.push(`/project/${projectId}`);

    } catch (error: unknown) {
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

  const template: TemplateDef | null = selectedTemplate;

  // Determine if generate button should be enabled
  const canGenerate = isGitHubMode
    ? !!githubContent
    : !!(text || links.filter(l => l.trim() !== '').length > 0 || files.length > 0);

  return (
    <Dialog.Root
      open={isTemplateInputOpen && !!template}
      onOpenChange={(open) => { if (!open) { setGithubContent(null); setGithubMeta(null); closeTemplateInput(); } }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl h-[620px] max-h-[85vh] bg-[#121214] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.6)] rounded-lg z-50 overflow-hidden flex flex-col data-[state=open]:animate-fade-in-up">
          {template && (
            <>
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02] flex-shrink-0">
                <Dialog.Title className="text-lg font-semibold text-white/90 flex items-center gap-2">
                  <span className="text-xl">{template.emoji}</span>
                  {template.name}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="text-muted hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-md cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="px-6 pt-4 pb-2 flex items-start gap-3 border-b border-white/5 bg-white/[0.01] flex-shrink-0">
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-muted leading-relaxed">{template.description}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-accent/80 bg-accent/10 px-1.5 py-0.5 rounded">
                      {TEMPLATE_CATEGORY_LABELS[template.category]}
                    </span>
                    <span className="text-[10px] font-mono text-white/50 bg-white/5 px-1.5 py-0.5 rounded">
                      default: {template.defaultDepth}
                    </span>
                    {template.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] font-mono text-white/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Specialized extraction instructions are applied for this content type
                  </p>
                </div>
              </div>

              {isGitHubMode ? (
                /* GitHub-specific input */
                <div className="flex-1 overflow-y-auto p-6 bg-black/20 min-h-0">
                  <GitHubInput
                    onRepoFetched={(content, meta) => {
                      setGithubContent(content);
                      setGithubMeta(meta);
                    }}
                    isGenerating={isGenerating}
                  />
                </div>
              ) : (
                /* Generic input tabs */
                <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
                  <div className="px-6 pt-4 flex-shrink-0">
                    <Tabs.List className="flex border-b border-white/10 gap-6">
                      <Tabs.Trigger value="text" className="pb-3 text-sm font-medium text-muted hover:text-white/80 data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent transition-colors flex items-center gap-2 cursor-pointer">
                        <FileText className="w-4 h-4" /> Text / Notes
                      </Tabs.Trigger>
                      <Tabs.Trigger value="links" className="pb-3 text-sm font-medium text-muted hover:text-white/80 data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent transition-colors flex items-center gap-2 cursor-pointer">
                        <LinkIcon className="w-4 h-4" /> URLs
                      </Tabs.Trigger>
                      <Tabs.Trigger value="files" className="pb-3 text-sm font-medium text-muted hover:text-white/80 data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent transition-colors flex items-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" /> Files (PDF/MD)
                      </Tabs.Trigger>
                    </Tabs.List>
                  </div>

                  <div className="flex-1 min-h-0 p-6 bg-black/20 overflow-hidden flex flex-col">
                    <Tabs.Content value="text" className="h-full flex-1 flex flex-col min-h-0 outline-none">
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full flex-1 bg-black/40 border border-white/10 rounded-lg p-4 text-sm text-white/90 font-mono placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 resize-none transition-all scrollbar-thin"
                        placeholder={`Paste the ${template.name.toLowerCase()} content here — transcript, notes, or raw text...`}
                      />
                    </Tabs.Content>

                    <Tabs.Content value="links" className="h-full flex-1 flex flex-col min-h-0 outline-none">
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {links.map((link, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="url"
                              value={link}
                              onChange={(e) => updateLink(i, e.target.value)}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="flex-1 bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50 transition-all"
                            />
                            {links.length > 1 && (
                              <button onClick={() => removeLink(i)} className="p-2 text-muted hover:text-red-400 bg-white/5 rounded-md hover:bg-white/10 transition-colors cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 flex-shrink-0">
                        <button
                          onClick={addLink}
                          className="text-xs font-mono text-accent hover:text-accent/80 transition-colors cursor-pointer"
                        >
                          + Add another URL
                        </button>
                      </div>
                    </Tabs.Content>

                    <Tabs.Content value="files" className="h-full flex-1 flex flex-col min-h-0 outline-none">
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
                          className="flex-1 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-4 bg-white/[0.01] hover:bg-white/[0.03] transition-colors border-accent/20 cursor-pointer"
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
                        <div className="flex-1 flex flex-col min-h-0">
                          <div className="flex justify-between items-center mb-3 flex-shrink-0">
                            <h4 className="text-sm font-medium text-white/90">Selected Files</h4>
                            <button onClick={() => fileInputRef.current?.click()} className="text-xs text-accent cursor-pointer hover:underline">Add more</button>
                          </div>
                          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                            {files.map((file, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-md">
                                <span className="text-sm text-white/90 font-mono truncate">{file.name}</span>
                                <button onClick={() => removeFile(i)} className="text-muted hover:text-red-400 cursor-pointer">
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
              )}

              <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between gap-4 flex-shrink-0">
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
                  disabled={isGenerating || !canGenerate}
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
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}