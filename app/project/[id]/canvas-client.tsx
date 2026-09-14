"use client";

import { useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, MiniMap, useNodesState, useEdgesState, addEdge, BackgroundVariant, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ArrowLeft, Share, Download, LayoutTemplate, Layers } from 'lucide-react';
import Link from 'next/link';

import CustomNode from '@/components/flow/custom-node';
import CustomEdge from '@/components/flow/custom-edge';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

interface CanvasClientProps {
  project: { name: string; sourcesCount: number };
  initialNodes: Node[];
  initialEdges: Edge[];
}

export default function CanvasClient({ project, initialNodes: _initialNodes, initialEdges: _initialEdges }: CanvasClientProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(_initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(_initialEdges);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge({ ...params, type: 'custom', animated: true }, eds)), [setEdges]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      
      {/* Top Navigation Overlay */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-black/40 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-muted hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div>
            <h1 className="text-sm font-medium text-white/90">{project.name}</h1>
            <p className="text-[10px] text-muted font-mono">Generated from {project.sourcesCount} sources • {nodes.length} Nodes</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors text-muted hover:text-white flex items-center gap-2 text-xs font-medium px-3">
            <LayoutTemplate className="w-3.5 h-3.5" />
            Auto-Layout
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-muted hover:text-white">
            <Share className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-muted hover:text-white">
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 rounded-md transition-colors ${isSidebarOpen ? 'bg-accent/20 text-accent' : 'hover:bg-white/10 text-muted hover:text-white'}`}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative mt-14 h-[calc(100vh-56px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          className="bg-[#09090b]"
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.05)" />
          <Controls className="!bg-black/60 !border-white/10 !backdrop-blur-md !rounded-lg !overflow-hidden" showInteractive={false} />
          <MiniMap 
            nodeColor="rgba(226,224,217,0.4)" 
            maskColor="rgba(0,0,0,0.6)" 
            className="!bg-[#0d0d11] !border-white/10 !rounded-lg" 
          />
        </ReactFlow>
      </div>

      {/* LeetCode-style Collapsible Sidebar */}
      {isSidebarOpen && (
        <aside className="w-80 border-l border-white/5 bg-[#0d0d11]/80 backdrop-blur-xl flex-shrink-0 flex flex-col z-30 mt-14 h-[calc(100vh-56px)] animate-fade-in">
          <div className="p-3 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-xs font-mono font-medium text-white/70 uppercase tracking-wider">Extraction Outline</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {nodes.map((node: any, i) => (
              <div key={i} className="group flex flex-col gap-1 border-l-2 border-white/10 pl-3 hover:border-accent/50 transition-colors">
                <span className="text-sm font-medium text-white/90 group-hover:text-accent transition-colors">{node.data.label}</span>
                <p className="text-xs text-muted leading-relaxed line-clamp-2">{node.data.summary}</p>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
