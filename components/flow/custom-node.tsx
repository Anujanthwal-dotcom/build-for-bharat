import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Plus, ArrowRight } from 'lucide-react';
import { CATEGORY_ACCENT_BORDER } from '@/lib/constants';

interface CustomNodeProps {
  id: string;
  data: {
    label: string;
    summary?: string;
    category?: string;
    tags?: string[];
    onAddSubcard?: (id: string) => void;
    onInspect?: (id: string) => void;
  };
  selected?: boolean;
}

const CustomNode = ({ id, data, selected }: CustomNodeProps) => {
  const accentColor = data.category
    ? CATEGORY_ACCENT_BORDER[data.category as keyof typeof CATEGORY_ACCENT_BORDER] ?? CATEGORY_ACCENT_BORDER.default
    : CATEGORY_ACCENT_BORDER.default;

  return (
    <div
      className={`group relative w-[250px] rounded-xl overflow-visible transition-all duration-200 ${
        selected
          ? 'border-white/20 ring-2 ring-accent/40 shadow-xl shadow-accent/15'
          : 'border-white/[0.08] hover:border-white/[0.2] hover:shadow-xl hover:shadow-black/50 hover:-translate-y-0.5'
      } bg-[#141418]/95 backdrop-blur-md border`}
    >
      {/* Category accent bar at top */}
      <div
        className="h-[3px] rounded-t-xl"
        style={{ backgroundColor: accentColor }}
      />

      <div className="p-4">
        {/* Category badge & quick add */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-[9px] font-mono uppercase tracking-wider text-white/50">
              {data.category ?? 'default'}
            </span>
          </div>

          {/* Quick Subcard Button */}
          {data.onAddSubcard && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                data.onAddSubcard?.(id);
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] hover:bg-accent text-white/60 hover:text-black border border-white/[0.08] hover:border-accent transition-all cursor-pointer shadow-sm group/btn"
              title="Add a sub-concept linked to this node"
            >
              <Plus className="w-2.5 h-2.5 group-hover/btn:scale-110 transition-transform" />
              <span>Subcard</span>
            </button>
          )}
        </div>

        {/* Node label */}
        <h3 className="text-sm font-semibold text-white/90 leading-snug">
          {data.label}
        </h3>

        {/* Summary – visible, highlighting on hover */}
        {data.summary && (
          <p className="text-[11px] text-white/50 leading-relaxed mt-1.5 line-clamp-2 group-hover:text-white/80 transition-colors duration-200 font-mono">
            {data.summary}
          </p>
        )}

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-white/[0.06]">
            {data.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono text-white/40 bg-white/[0.04] px-1.5 py-0.5 rounded-sm border border-white/[0.06]"
              >
                {tag}
              </span>
            ))}
            {data.tags.length > 3 && (
              <span className="text-[10px] font-mono text-white/25">
                +{data.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Click to explore details indicator */}
        <div
          onClick={(e) => {
            if (data.onInspect) {
              e.stopPropagation();
              data.onInspect(id);
            }
          }}
          className="mt-2.5 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-white/30 group-hover:text-accent transition-colors cursor-pointer"
        >
          <span>Inspect breakdown</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Single Target Handle (Left center - Drop link here) */}
      <Handle
        key="t-0"
        id="t-0"
        type="target"
        position={Position.Left}
        style={{ top: '50%' }}
        className="!w-3 !h-3 !-left-[6px] !bg-[#141418] !border-2 !border-white/50 hover:!border-white hover:!scale-125 !rounded-full transition-all cursor-crosshair z-20 shadow-sm"
        title="Drop link here"
      />
      {/* Hidden fallback handles for backward compatibility with existing saved graphs */}
      {Array.from({ length: 9 }, (_, i) => (
        <Handle
          key={`t-${i + 1}`}
          id={`t-${i + 1}`}
          type="target"
          position={Position.Left}
          style={{ top: '50%' }}
          className="!w-0 !h-0 !opacity-0 !border-none !pointer-events-none"
        />
      ))}

      {/* Single Connecting Dot (Right center - Drag to connect) */}
      <Handle
        key="s-0"
        id="s-0"
        type="source"
        position={Position.Right}
        style={{ top: '50%', borderColor: accentColor }}
        className="!w-3 !h-3 !-right-[6px] !bg-[#141418] !border-2 hover:!scale-125 !rounded-full transition-all cursor-crosshair z-20 shadow-sm group-hover:ring-2 group-hover:ring-accent/40"
        title="Drag to link to another node"
      />
      {/* Hidden fallback handles for backward compatibility with existing saved graphs */}
      {Array.from({ length: 9 }, (_, i) => (
        <Handle
          key={`s-${i + 1}`}
          id={`s-${i + 1}`}
          type="source"
          position={Position.Right}
          style={{ top: '50%' }}
          className="!w-0 !h-0 !opacity-0 !border-none !pointer-events-none"
        />
      ))}
    </div>
  );
};

export default memo(CustomNode);
