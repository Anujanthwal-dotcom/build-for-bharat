import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CATEGORY_ACCENT_BORDER } from '@/lib/constants';

interface CustomNodeProps {
  data: {
    label: string;
    summary?: string;
    category?: string;
    tags?: string[];
  };
  selected?: boolean;
}

const CustomNode = ({ data, selected }: CustomNodeProps) => {
  const accentColor = data.category
    ? CATEGORY_ACCENT_BORDER[data.category as keyof typeof CATEGORY_ACCENT_BORDER] ?? CATEGORY_ACCENT_BORDER.default
    : CATEGORY_ACCENT_BORDER.default;

  return (
    <div
      className={`group relative w-[240px] rounded-xl overflow-hidden transition-all duration-200 ${
        selected
          ? 'border-white/20 ring-2 ring-accent/30 shadow-lg shadow-accent/10'
          : 'border-white/[0.08] hover:border-white/[0.16] hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5'
      } bg-[#141418]/90 backdrop-blur-sm border`}
    >
      {/* Category accent bar at top */}
      <div
        className="h-[3px]"
        style={{ backgroundColor: accentColor }}
      />

      <div className="p-4">
        {/* Category badge */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-[9px] font-mono uppercase tracking-wider text-white/40">
            {data.category ?? 'default'}
          </span>
        </div>

        {/* Node label */}
        <h3 className="text-sm font-semibold text-white/90 leading-snug">
          {data.label}
        </h3>

        {/* Summary – visible on hover */}
        {data.summary && (
          <p className="text-[11px] text-white/30 leading-relaxed mt-1.5 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {data.summary}
          </p>
        )}

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-white/[0.06]">
            {data.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-[10px] font-mono text-white/35 bg-white/[0.04] px-1.5 py-0.5 rounded-sm border border-white/[0.06]"
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
      </div>

      {/* Handles – invisible but functional, spread vertically */}
      {Array.from({ length: 10 }, (_, i) => (
        <Handle
          key={`t-${i}`}
          id={`t-${i}`}
          type="target"
          position={Position.Left}
          style={{ top: `${((i + 0.5) * 100) / 10}%` }}
          className="!w-2 !h-2 !bg-transparent !border-none !opacity-0"
        />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <Handle
          key={`s-${i}`}
          id={`s-${i}`}
          type="source"
          position={Position.Right}
          style={{ top: `${((i + 0.5) * 100) / 10}%` }}
          className="!w-2 !h-2 !bg-transparent !border-none !opacity-0"
        />
      ))}
    </div>
  );
};

export default memo(CustomNode);
