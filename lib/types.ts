export type SourceType = "text" | "link" | "file";

export interface Source {
  id: string;
  type: SourceType;
  content: string;
  label: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  sourceCount: number;
  sources?: Source[];
  gradient?: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  summary: string;
  category: string;
  x?: number;
  y?: number;
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export type DepthLevel = "summary" | "standard" | "deep";

export type LayoutDirection = "LR" | "TB";

export interface GenerateRequest {
  projectId: string;
  depth: DepthLevel;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  text?: string;
  urls?: string[];
}

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};
