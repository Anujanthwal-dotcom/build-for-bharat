import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { CATEGORY_COLORS } from '@/lib/constants';

const SOURCE_HANDLES = 10;
const TARGET_HANDLES = 10;

const spreadTop = (i: number, total: number) => `${((i + 0.5) * 100) / total}%`;

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
  const catStyle = data.category && CATEGORY_COLORS[data.category as keyof typeof CATEGORY_COLORS] ? CATEGORY_COLORS[data.category as keyof typeof CATEGORY_COLORS] : CATEGORY_COLORS.default;

  return (
    <div className={`relative min-w-[220px] max-w-[280px] rounded-lg p-4 transition-all duration-300 glass hover:shadow-[0_12px_40px_rgba(226,224,217,0.15)] ${
      selected ? 'border-accent ring-1 ring-accent/50 shadow-[0_0_30px_rgba(226,224,217,0.2)] bg-white/[0.08]' : 'bg-white/[0.04]'
    }`}>
      {Array.from({ length: TARGET_HANDLES }, (_, i) => (
        <Handle
          key={`t-${i}`}
          id={`t-${i}`}
          type="target"
          position={Position.Left}
          style={{ top: spreadTop(i, TARGET_HANDLES) }}
          className="!w-1 !h-1.5 !bg-white/20 !rounded-none !border-none !left-[-1px] opacity-0 hover:opacity-100 transition-opacity"
        />
      ))}
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-semibold text-white/90 leading-tight">{data.label}</h3>
          {data.category && (
            <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${catStyle}`}>
              {data.category}
            </span>
          )}
        </div>
        
        {data.summary && (
          <p className="text-xs text-muted leading-relaxed mt-1">
            {data.summary}
          </p>
        )}

        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/5">
            {data.tags.map(tag => (
              <span key={tag} className="text-[10px] font-mono text-white/50 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {Array.from({ length: SOURCE_HANDLES }, (_, i) => (
        <Handle
          key={`s-${i}`}
          id={`s-${i}`}
          type="source"
          position={Position.Right}
          style={{ top: spreadTop(i, SOURCE_HANDLES) }}
          className="!w-1 !h-1.5 !bg-accent/50 !rounded-none !border-none !right-[-1px] opacity-0 hover:opacity-100 transition-opacity"
        />
      ))}
    </div>
  );
};

export default memo(CustomNode);
