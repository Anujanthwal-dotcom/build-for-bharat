import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  return (
    <>
      <defs>
        <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(226,224,217,0.1)" />
          <stop offset="50%" stopColor={selected ? "rgba(226,224,217,0.8)" : "rgba(226,224,217,0.4)"} />
          <stop offset="100%" stopColor="rgba(226,224,217,0.1)" />
        </linearGradient>
      </defs>
      
      {/* Background shadow path */}
      <BaseEdge 
        id={`${id}-bg`}
        path={edgePath} 
        style={{
          ...style,
          strokeWidth: 6,
          stroke: 'rgba(0,0,0,0.4)',
          filter: 'blur(4px)',
        }}
      />
      
      {/* Main animated path */}
      <BaseEdge 
        id={id} 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: selected ? 2 : 1.5,
          stroke: `url(#gradient-${id})`,
          strokeDasharray: '4 4',
        }} 
        className={selected ? 'animate-dash-flow' : 'opacity-60'}
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
