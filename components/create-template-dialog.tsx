"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2, Plus } from "lucide-react";
import type { CustomTemplateRecord } from "@/lib/constants";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (template: CustomTemplateRecord) => void;
}

const inputClasses =
  "w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all";

const labelClasses = "text-[10px] font-mono text-muted uppercase tracking-wider mb-1.5 block";

export default function CreateTemplateDialog({ open, onOpenChange, onCreated }: CreateTemplateDialogProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📝");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [suggestedInput, setSuggestedInput] = useState("any");
  const [defaultDepth, setDefaultDepth] = useState("standard");
  const [systemInstructions, setSystemInstructions] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setEmoji("📝");
    setDescription("");
    setTags("");
    setSuggestedInput("any");
    setDefaultDepth("standard");
    setSystemInstructions("");
    setError(null);
    setIsCreating(false);
  };

  const handleCreate = async () => {
    setError(null);
    if (!name.trim() || !description.trim() || !systemInstructions.trim()) {
      setError("Name, description, and instructions are required.");
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          emoji: emoji.trim() || "📝",
          description: description.trim(),
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          systemInstructions: systemInstructions.trim(),
          defaultDepth,
          suggestedInput,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create template");
      }
      onCreated(data.template as CustomTemplateRecord);
      onOpenChange(false);
      reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create template");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-[#121214] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.6)] rounded-lg z-50 overflow-hidden flex flex-col max-h-[85vh] data-[state=open]:animate-fade-in-up">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <Dialog.Title className="text-lg font-semibold text-white/90 flex items-center gap-2">
              <Plus className="w-4 h-4 text-accent" />
              Create Custom Template
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-muted hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-black/20 space-y-4">
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <div>
                <label className={labelClasses}>Emoji</label>
                <input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className={`${inputClasses} text-center`}
                  maxLength={8}
                />
              </div>
              <div>
                <label className={labelClasses}>Template name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Podcast Episode"
                  className={inputClasses}
                  maxLength={80}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What kind of content is this template for and how should the mindmap look?"
                className={`${inputClasses} resize-none`}
                rows={2}
                maxLength={300}
              />
            </div>

            <div>
              <label className={labelClasses}>Tags (comma separated)</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="video, education, quick"
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClasses}>Default input</label>
                <select
                  value={suggestedInput}
                  onChange={(e) => setSuggestedInput(e.target.value)}
                  className={inputClasses}
                >
                  <option value="any">Any (text first)</option>
                  <option value="url">URL</option>
                  <option value="text">Text</option>
                  <option value="file">File</option>
                  <option value="github">GitHub Repo</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Default depth</label>
                <select
                  value={defaultDepth}
                  onChange={(e) => setDefaultDepth(e.target.value)}
                  className={inputClasses}
                >
                  <option value="summary">Summary</option>
                  <option value="standard">Standard</option>
                  <option value="deep">Deep Dive</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClasses}>AI instructions *</label>
              <textarea
                value={systemInstructions}
                onChange={(e) => setSystemInstructions(e.target.value)}
                placeholder="Tell the AI how to structure the mindmap for this content type. E.g. 'This is a podcast... focus on topics and viewpoints, skip filler.'"
                className={`${inputClasses} resize-none font-mono text-xs`}
                rows={5}
                maxLength={2000}
              />
              <p className="text-[10px] text-muted mt-1 font-mono">
                Appended to the base extraction prompt every time this template is used.
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}
          </div>

          <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex justify-end">
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="flex items-center gap-2 bg-accent text-black font-medium px-5 py-2 rounded-md hover:bg-accent/90 transition-all text-sm disabled:opacity-50 disabled:cursor-wait shadow-[0_0_15px_rgba(226,224,217,0.3)]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Template
                  <Plus className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}