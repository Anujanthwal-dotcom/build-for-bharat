import { BaseEdge, EdgeProps, Position, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';

const END_OFFSET = 4;

export default function CustomEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    data,
    selected
  } = props;

  let sX = sourceX;
  let tX = targetX;
  if (sourcePosition === Position.Right) sX += END_OFFSET;
  else if (sourcePosition === Position.Left) sX -= END_OFFSET;
  if (targetPosition === Position.Left) tX -= END_OFFSET;
  else if (targetPosition === Position.Right) tX += END_OFFSET;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: sX,
    sourceY,
    sourcePosition,
    targetX: tX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          strokeWidth: selected ? 2.5 : 2,
          stroke: selected ? 'rgba(226,224,217,0.8)' : 'rgba(226,224,217,0.4)',
          strokeDasharray: '6 4',
          strokeLinecap: 'round',
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
            <div className={`px-2 py-0.5 rounded-full text-[9px] font-mono whitespace-nowrap border glass transition-all ${
              selected ? 'border-accent/40 text-accent bg-black/80' : 'border-white/10 text-muted bg-black/60'
            }`}>
              {String(data.label)}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
