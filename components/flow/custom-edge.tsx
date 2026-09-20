import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer, useReactFlow } from '@xyflow/react';
import { X } from 'lucide-react';

export default function CustomEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
  } = props;

  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
    offset: 20,
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          strokeWidth: selected ? 2.5 : 2,
          stroke: selected ? 'rgba(226,224,217,0.85)' : 'rgba(255,255,255,0.2)',
          strokeDasharray: '6 4',
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />

      {(data?.label || selected) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan flex items-center gap-1 group/edge z-30"
          >
            {Boolean(data?.label) && (
              <div
                className={`px-2 py-0.5 rounded-md text-[9px] font-mono whitespace-nowrap border transition-all ${
                  selected
                    ? 'border-accent/40 text-white/90 bg-[#141418] shadow-md ring-1 ring-accent/20'
                    : 'border-white/[0.08] text-white/50 bg-[#141418]/90'
                }`}
              >
                {String(data?.label)}
              </div>
            )}

            {selected && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-4 h-4 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-md"
                title="Remove link"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
