"use client";

import { useEffect, useState } from "react";
import { Blocks, ArrowRight, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import {
  BUILTIN_TEMPLATES,
  TEMPLATE_CATEGORY_LABELS,
  type CustomTemplateRecord,
  type TemplateDef,
} from "@/lib/constants";
import { useUIStore } from "@/lib/store/ui-store";
import TemplateInputModal from "@/components/template-input-modal";
import CreateTemplateDialog from "@/components/create-template-dialog";

function customToDef(record: CustomTemplateRecord): TemplateDef {
  return {
    id: `custom-${record.id}`,
    name: record.name,
    emoji: record.emoji,
    description: record.description,
    tags: record.tags,
    category: "custom",
    systemInstructions: record.systemInstructions,
    defaultDepth: record.defaultDepth,
    suggestedInput: record.suggestedInput,
    isCustom: true,
  };
}

const depthBadge: Record<TemplateDef["defaultDepth"], string> = {
  summary: "bg-white/5 text-white/50",
  standard: "bg-accent/10 text-accent/80",
  deep: "bg-purple-500/10 text-purple-400",
};

export default function TemplatesPage() {
  const openTemplateInput = useUIStore((state) => state.openTemplateInput);
  const [customTemplates, setCustomTemplates] = useState<TemplateDef[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/templates");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          setCustomTemplates((data.templates as CustomTemplateRecord[]).map(customToDef));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (template: TemplateDef) => {
    const id = template.id.replace("custom-", "");
    if (!window.confirm(`Delete "${template.name}"?`)) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete");
      setCustomTemplates((prev) => prev.filter((t) => t.id !== template.id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete template");
    }
  };

  const handleCreated = (record: CustomTemplateRecord) => {
    setCustomTemplates((prev) => [customToDef(record), ...prev]);
  };

  const renderCard = (template: TemplateDef) => (
    <div
      key={template.id}
      className="glass p-5 rounded-lg space-y-3 hover:bg-white/[0.04] transition-colors group flex flex-col"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">{template.emoji}</span>
          <h3 className="text-sm font-medium text-white/90 truncate">{template.name}</h3>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {template.isCustom ? (
            <button
              onClick={() => handleDelete(template)}
              className="p-1.5 rounded-md text-muted hover:text-red-400 hover:bg-white/10 transition-colors"
              title="Delete template"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[10px] font-mono text-accent/70 bg-accent/10 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              built-in
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-muted leading-relaxed line-clamp-3">{template.description}</p>
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
          {TEMPLATE_CATEGORY_LABELS[template.category]}
        </span>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${depthBadge[template.defaultDepth]}`}>
          {template.defaultDepth}
        </span>
        {template.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-[10px] font-mono text-accent/60 bg-accent/5 px-1.5 py-0.5 rounded">
            #{tag}
          </span>
        ))}
      </div>
      <button
        onClick={() => openTemplateInput(template)}
        className="mt-auto w-full text-xs font-medium text-muted hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
      >
        Use Template
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 dot-grid">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Blocks className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white/90 tracking-tight">Templates</h1>
              <p className="text-sm text-muted">
                Pick a content type — we apply specialized extraction to your sources.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-accent text-black font-medium px-4 py-2 rounded-md hover:bg-accent/90 transition-colors text-sm shadow-[0_0_15px_rgba(226,224,217,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading templates...
          </div>
        ) : (
          <>
            {customTemplates.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-white/70 tracking-tight uppercase text-xs font-mono text-muted">
                  Your Templates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customTemplates.map(renderCard)}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-wider text-muted">Built-in Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {BUILTIN_TEMPLATES.map(renderCard)}
              </div>
            </div>
          </>
        )}

        <p className="text-center text-xs text-muted font-mono">
          Custom templates are stored in your account and use your own AI instructions.
        </p>
      </div>

      <TemplateInputModal />
      <CreateTemplateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}