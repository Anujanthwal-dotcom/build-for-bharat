import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface CustomNodeProps {
  data: {
    label: string;
    summary?: string;
    category?: string;
    tags?: string[];
  };
  selected?: boolean;
}

const categoryColors: Record<string, string> = {
  core: 'bg-accent/20 text-accent border-accent/30',
  memory: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  execution: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  concurrency: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  default: 'bg-white/10 text-white/80 border-white/20',
};

const CustomNode = ({ data, selected }: CustomNodeProps) => {
  const catStyle = data.category && categoryColors[data.category] ? categoryColors[data.category] : categoryColors.default;

  return (
    <div className={`relative min-w-[220px] max-w-[280px] rounded-lg p-4 transition-all duration-300 glass hover:shadow-[0_12px_40px_rgba(226,224,217,0.15)] ${
      selected ? 'border-accent ring-1 ring-accent/50 shadow-[0_0_30px_rgba(226,224,217,0.2)] bg-white/[0.08]' : 'bg-white/[0.04]'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-16 !h-1 !bg-white/20 !rounded-none !border-none !top-[-1px] opacity-0 hover:opacity-100 transition-opacity" />
      
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

      <Handle type="source" position={Position.Bottom} className="!w-16 !h-1 !bg-accent/50 !rounded-none !border-none !bottom-[-1px] opacity-0 hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default memo(CustomNode);
