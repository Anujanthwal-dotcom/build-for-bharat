import type { GraphData, Project, Source } from "@/lib/types";

export const MOCK_GRAPH_REACT: GraphData = {
  nodes: [
    {
      id: "1",
      label: "React",
      summary: "A JavaScript library for building user interfaces with a declarative component model.",
      category: "core",
    },
    {
      id: "2",
      label: "Virtual DOM",
      summary: "In-memory representation of the UI that enables efficient diffing and batched updates.",
      category: "concept",
    },
    {
      id: "3",
      label: "Reconciliation",
      summary: "The algorithm React uses to diff virtual DOM trees and reuse existing DOM nodes.",
      category: "pattern",
    },
    {
      id: "4",
      label: "Fibers",
      summary: "Internal work units that enable incremental rendering and prioritization of updates.",
      category: "runtime",
    },
    {
      id: "5",
      label: "Concurrent Mode",
      summary: "Splits rendering work so urgent updates can interrupt long-running render passes.",
      category: "runtime",
    },
    {
      id: "6",
      label: "Hooks",
      summary: "Functions that let components use state, effects, context refs without classes.",
      category: "api",
    },
    {
      id: "7",
      label: "useState / useEffect",
      summary: "Core hook primitives for local state and lifecycle side effects.",
      category: "api",
    },
    {
      id: "8",
      label: "Context / Suspense",
      summary: "Share data across the tree and suspend rendering until async data resolves.",
      category: "api",
    },
    {
      id: "9",
      label: "React 19 Compiler",
      summary: "Automatically memoizes components to avoid unnecessary re-renders.",
      category: "tool",
    },
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2", label: "renders via" },
    { id: "e2-3", source: "2", target: "3", label: "diffed by" },
    { id: "e3-4", source: "3", target: "4", label: "built on" },
    { id: "e4-5", source: "4", target: "5", label: "enables" },
    { id: "e1-6", source: "1", target: "6", label: "unlocks" },
    { id: "e6-7", source: "6", target: "7", label: "includes" },
    { id: "e6-8", source: "6", target: "8", label: "includes" },
    { id: "e1-9", source: "1", target: "9", label: "powered by" },
  ],
};

export const MOCK_GRAPH_NODEJS: GraphData = {
  nodes: [
    {
      id: "1",
      label: "Node.js",
      summary: "Asynchronous event-driven JavaScript runtime built on Chrome's V8 engine.",
      category: "core",
    },
    {
      id: "2",
      label: "Event Loop",
      summary: "Orchestrates async callbacks across phases: timers, I/O, poll, check, close.",
      category: "runtime",
    },
    {
      id: "3",
      label: "libuv",
      summary: "C library providing the event loop and thread pool for I/O operations.",
      category: "core",
    },
    {
      id: "4",
      label: "Call Stack",
      summary: "LIFO structure holding executing function frames for synchronous work.",
      category: "runtime",
    },
    {
      id: "5",
      label: "Message Queue",
      summary: "Holds ready callbacks awaiting execution once the stack is clear.",
      category: "runtime",
    },
    {
      id: "6",
      label: "Streams",
      summary: "Chunked data flow with backpressure for handling large payloads.",
      category: "pattern",
    },
    {
      id: "7",
      label: "Worker Threads",
      summary: "Run CPU-bound JavaScript in parallel via a thread pool (libuv).",
      category: "api",
    },
    {
      id: "8",
      label: "Cluster Module",
      summary: "Spawns child processes sharing the same server port for load balancing.",
      category: "api",
    },
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2", label: "runs on" },
    { id: "e2-3", source: "2", target: "3", label: "implemented by" },
    { id: "e2-4", source: "2", target: "4", label: "interleaves with" },
    { id: "e2-5", source: "2", target: "5", label: "feeds from" },
    { id: "e1-6", source: "1", target: "6", label: "exposes" },
    { id: "e3-7", source: "3", target: "7", label: "backs" },
    { id: "e1-8", source: "1", target: "8", label: "includes" },
  ],
};

export const MOCK_GRAPH_DOCKER: GraphData = {
  nodes: [
    {
      id: "1",
      label: "Docker",
      summary: "Containerization platform packaging apps with their dependencies into isolated units.",
      category: "core",
    },
    {
      id: "2",
      label: "Images",
      summary: "Immutable, layered snapshots built from a Dockerfile.",
      category: "concept",
    },
    {
      id: "3",
      label: "Dockerfile",
      summary: "Declarative recipe: FROM, RUN, COPY, CMD directives build each layer.",
      category: "tool",
    },
    {
      id: "4",
      label: "Containers",
      summary: "Runnable instances of images with isolated filesystem, PID, and network namespaces.",
      category: "runtime",
    },
    {
      id: "5",
      label: "Namespaces",
      summary: "Kernel isolation: PID, NET, MNT, UTS, IPC per container.",
      category: "concept",
    },
    {
      id: "6",
      label: "cgroups",
      summary: "Control groups limit CPU, memory, and I/O usage per container.",
      category: "concept",
    },
    {
      id: "7",
      label: "Volumes",
      summary: "Persistent storage surviving container lifecycle, mounted from the host.",
      category: "api",
    },
    {
      id: "8",
      label: "Networks",
      summary: "Bridge, host, and overlay drivers connect containers securely.",
      category: "api",
    },
    {
      id: "9",
      label: "Compose",
      summary: "Multi-container orchestration declared in a single YAML file.",
      category: "tool",
    },
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2", label: "builds" },
    { id: "e2-3", source: "2", target: "3", label: "described by" },
    { id: "e2-4", source: "2", target: "4", label: "spawns" },
    { id: "e4-5", source: "4", target: "5", label: "isolated by" },
    { id: "e4-6", source: "4", target: "6", label: "limited by" },
    { id: "e4-7", source: "4", target: "7", label: "persists to" },
    { id: "e4-8", source: "4", target: "8", label: "connects via" },
    { id: "e1-9", source: "1", target: "9", label: "bundles" },
  ],
};

export const MOCK_GRAPH_GRAPHQL: GraphData = {
  nodes: [
    {
      id: "1",
      label: "GraphQL",
      summary: "Query language and runtime allowing clients to request exactly the data they need.",
      category: "core",
    },
    {
      id: "2",
      label: "Schema",
      summary: "Typed contract defining types, queries, mutations, and subscriptions.",
      category: "concept",
    },
    {
      id: "3",
      label: "Resolvers",
      summary: "Functions resolving each field in the schema to real data.",
      category: "pattern",
    },
    {
      id: "4",
      label: "SDL Types",
      summary: "Type system: scalars, objects, interfaces, enums, unions, input types.",
      category: "concept",
    },
    {
      id: "5",
      label: "Query",
      summary: "Read operation with a top-level query type.",
      category: "api",
    },
    {
      id: "6",
      label: "Mutation",
      summary: "Write operation enabling create/update/delete flows.",
      category: "api",
    },
    {
      id: "7",
      label: "Subscription",
      summary: "Real-time streaming operations over WebSockets.",
      category: "api",
    },
    {
      id: "8",
      label: "N+1 Problem",
      summary: "Eager-load bottleneck mitigated by DataLoader batching + caching.",
      category: "pattern",
    },
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2", label: "governed by" },
    { id: "e2-4", source: "2", target: "4", label: "composed of" },
    { id: "e2-5", source: "2", target: "5", label: "entry for" },
    { id: "e2-6", source: "2", target: "6", label: "entry for" },
    { id: "e2-7", source: "2", target: "7", label: "entry for" },
    { id: "e1-3", source: "1", target: "3", label: "executes" },
    { id: "e3-8", source: "3", target: "8", label: "suffers from" },
  ],
};

export const MOCK_GRAPHS: Record<string, GraphData> = {
  React: MOCK_GRAPH_REACT,
  "Node.js": MOCK_GRAPH_NODEJS,
  Docker: MOCK_GRAPH_DOCKER,
  GraphQL: MOCK_GRAPH_GRAPHQL,
};

export function getMockGraph(topic?: string): GraphData {
  if (topic) {
    const found = Object.entries(MOCK_GRAPHS).find(([name]) =>
      topic.toLowerCase().includes(name.toLowerCase()),
    );
    if (found) return found[1];
  }
  return MOCK_GRAPH_REACT;
}

const REACT_SOURCE: Source = {
  id: "s-react-mdn",
  type: "text",
  content:
    "React is a JavaScript library for building user interfaces. Components return virtual DOM trees. React reconciles updates via fibers and supports concurrent rendering. Hooks allow stateful logic in function components.",
  label: "react-notes.md",
};

const NODEJS_SOURCE: Source = {
  id: "s-nodejs",
  type: "url",
  content:
    "Node.js runs JavaScript on the V8 engine. The event loop is backed by libuv and handles async I/O. Streams support backpressure. Worker threads run CPU-bound tasks in parallel.",
  label: "nodejs.org/docs",
};

const DOCKER_SOURCE: Source = {
  id: "s-docker",
  type: "pdf",
  content:
    "Docker packages applications into layered images. Containers use kernel namespaces for isolation and cgroups for resource limits. Volumes persist state; Compose orchestrates multi-service stacks.",
  label: "docker-overview.pdf",
};

const GRAPHQL_SOURCE: Source = {
  id: "s-graphql",
  type: "url",
  content:
    "GraphQL defines a typed schema with queries, mutations, and subscriptions. Resolvers fetch field data; DataLoader solves the N+1 problem through batching.",
  label: "graphql.org/learn",
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: "p-react",
    name: "React 19 Fundamentals",
    description: "Core rendering model, reconciliation, and hooks explained visually.",
    createdAt: "2026-09-12T14:30:00Z",
    updatedAt: "2026-09-12T14:30:00Z",
    nodeCount: MOCK_GRAPH_REACT.nodes.length,
    sourceCount: 1,
    gradient: "from-cyan-500/40 to-blue-600/20",
    sources: [REACT_SOURCE],
  },
  {
    id: "p-nodejs",
    name: "Node.js Event Loop",
    description: "How libuv, the call stack, and message queue cooperate under the hood.",
    createdAt: "2026-09-10T09:15:00Z",
    updatedAt: "2026-09-11T18:45:00Z",
    nodeCount: MOCK_GRAPH_NODEJS.nodes.length,
    sourceCount: 2,
    gradient: "from-emerald-500/40 to-teal-600/20",
    sources: [NODEJS_SOURCE],
  },
  {
    id: "p-docker",
    name: "Docker in Depth",
    description: "Layered images, namespaces, cgroups, volumes, and Compose.",
    createdAt: "2026-09-08T11:00:00Z",
    updatedAt: "2026-09-09T20:10:00Z",
    nodeCount: MOCK_GRAPH_DOCKER.nodes.length,
    sourceCount: 3,
    gradient: "from-violet-600/40 to-fuchsia-600/20",
    sources: [DOCKER_SOURCE],
  },
  {
    id: "p-graphql",
    name: "GraphQL Deep Dive",
    description: "Schema design, resolvers, and solving the N+1 problem.",
    createdAt: "2026-09-05T16:20:00Z",
    updatedAt: "2026-09-06T08:00:00Z",
    nodeCount: MOCK_GRAPH_GRAPHQL.nodes.length,
    sourceCount: 1,
    gradient: "from-amber-500/40 to-orange-600/20",
    sources: [GRAPHQL_SOURCE],
  },
];

export function getMockProject(id: string): Project | undefined {
  return MOCK_PROJECTS.find((project) => project.id === id);
}

export function getMockGraphForProject(id: string): GraphData {
  switch (id) {
    case "p-nodejs":
      return MOCK_GRAPH_NODEJS;
    case "p-docker":
      return MOCK_GRAPH_DOCKER;
    case "p-graphql":
      return MOCK_GRAPH_GRAPHQL;
    default:
      return MOCK_GRAPH_REACT;
  }
}

export const ONBOARDING_EXAMPLE_TEXT = `\`\`\`markdown
# V8 Engine Internals

V8 compiles JavaScript to machine code via Ignition (interpreter) and TurboFan (optimizing compiler).

Key concepts:
1. The call stack holds execution frames for function calls (LIFO).
2. The memory heap stores objects and closures, managed by the garbage collector.
3. Generational GC uses a young generation (scavenger) and an old generation (mark-sweep).
4. Inline caches accelerate dynamic property lookups.
5. Hidden classes share shape descriptors across objects.

Runtime features:
- Event loop integrates with libuv for async I/O.
- Microtask queue drains after each macrotask.
\`\`\``;