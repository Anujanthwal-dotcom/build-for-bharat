import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';

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

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          strokeWidth: selected ? 2.5 : 2,
          stroke: selected ? 'rgba(226,224,217,0.45)' : 'rgba(255,255,255,0.15)',
          strokeDasharray: '6 4',
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />

      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className={`px-2 py-0.5 rounded-md text-[9px] font-mono whitespace-nowrap border transition-all ${
                selected
                  ? 'border-white/15 text-white/70 bg-[#141418]'
                  : 'border-white/[0.06] text-white/40 bg-[#141418]/80'
              }`}
            >
              {String(data.label)}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
